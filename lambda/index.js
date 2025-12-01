const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Stripe webhook needs raw body
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      const session = event.data.object;
      const customerEmail = session.customer_email || session.customer_details?.email;
      
      if (customerEmail) {
        // TODO: Update DynamoDB instead of users.json
        console.log(`Payment received for ${customerEmail}`);
      }
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json({ limit: '10mb' }));

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const USERS_TABLE = process.env.USERS_TABLE || 'project-management-users';
const TOKENS_TABLE = process.env.TOKENS_TABLE || 'project-management-reset-tokens';

const sesClient = new SESClient({ 
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1'
});

const sendEmail = async (to, subject, html) => {
  const fromEmail = process.env.FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    console.log(`EMAIL: To=${to}, Subject=${subject}`);
    return true;
  }
  
  try {
    await sesClient.send(new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } }
      }
    }));
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('SES error:', error.message);
    return false;
  }
};

const constantTimeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existing = await docClient.send(new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: 'username = :u OR email = :e',
      ExpressionAttributeValues: { ':u': username, ':e': email }
    }));
    
    if (existing.Items && existing.Items.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const projectLimit = email === process.env.BACKDOOR_USER_EMAIL ? -1 : parseInt(process.env.DEFAULT_PROJECT_LIMIT) || 6;
    const newUser = { 
      id: `user-${Date.now()}`, 
      username, 
      email, 
      password,
      projectLimit,
      projectCount: 0
    };
    
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: newUser
    }));
    
    res.json({ id: newUser.id, username, email, projectLimit, projectCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await docClient.send(new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email }
    }));
    
    const user = result.Items && result.Items[0];
    
    if (user && constantTimeCompare(user.password, password)) {
      return res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        projectLimit: user.projectLimit,
        projectCount: user.projectCount
      });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/limits', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: req.params.userId }
    }));
    
    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      projectLimit: result.Item.projectLimit,
      projectCount: result.Item.projectCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/increment-projects', async (req, res) => {
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { id: req.params.userId },
      UpdateExpression: 'SET projectCount = if_not_exists(projectCount, :zero) + :inc',
      ExpressionAttributeValues: { ':inc': 1, ':zero': 0 },
      ReturnValues: 'ALL_NEW'
    }));
    
    res.json({ projectCount: result.Attributes.projectCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/decrement-projects', async (req, res) => {
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { id: req.params.userId },
      UpdateExpression: 'SET projectCount = if_not_exists(projectCount, :one) - :dec',
      ExpressionAttributeValues: { ':dec': 1, ':one': 1 },
      ReturnValues: 'ALL_NEW'
    }));
    
    res.json({ projectCount: Math.max(0, result.Attributes.projectCount) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await docClient.send(new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email }
    }));
    
    const user = result.Items && result.Items[0];
    
    if (!user) {
      return res.status(200).json({ message: 'If email exists, reset link sent' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000;
    
    await docClient.send(new PutCommand({
      TableName: TOKENS_TABLE,
      Item: { token, userId: user.id, expiresAt }
    }));
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`
    );
    
    res.json({ message: 'If email exists, reset link sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/confirm-reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const result = await docClient.send(new GetCommand({
      TableName: TOKENS_TABLE,
      Key: { token }
    }));
    
    if (!result.Item || result.Item.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { id: result.Item.userId },
      UpdateExpression: 'SET password = :p',
      ExpressionAttributeValues: { ':p': newPassword }
    }));
    
    await docClient.send(new DeleteCommand({
      TableName: TOKENS_TABLE,
      Key: { token }
    }));
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const success = await sendEmail(to, subject, body);
    
    if (success) {
      res.json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/auth/delete-account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: userId }
    }));
    
    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.Item;
    
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length > 0) {
          const customer = customers.data[0];
          const subscriptions = await stripe.subscriptions.list({ customer: customer.id });
          
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
          
          await stripe.customers.del(customer.id);
        }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError.message);
      }
    }
    
    await docClient.send(new DeleteCommand({
      TableName: USERS_TABLE,
      Key: { id: userId }
    }));
    
    await sendEmail(
      user.email,
      'Account Deleted',
      '<p>Your account has been successfully deleted.</p>'
    );
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getBedrockClient = () => {
  return new BedrockRuntimeClient({
    region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY,
      secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY,
    }
  });
};

app.post('/api/bedrock/generate', async (req, res) => {
  try {
    const { model, prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const modelId = model || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const client = getBedrockClient();
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({ text: responseBody.content[0].text });
  } catch (error) {
    console.error('Bedrock error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/test/bedrock', async (req, res) => {
  try {
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY,
        secretAccessKey: process.env.AWS_BEDROCK_SECRET_KEY
      }
    });

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Hello, this is a test' }]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({ success: true, message: 'Bedrock test successful', response: responseBody.content[0].text });
  } catch (error) {
    console.error('Bedrock test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/test/gemini', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, error: 'Gemini API key not configured' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, this is a test' }] }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, error: `Gemini error: ${response.status} ${errorText}` });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.json({ success: true, message: 'Gemini test successful', response: text });
  } catch (error) {
    console.error('Gemini test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Try Lambda environment variable first (from Secrets Manager), then VITE fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Gemini API key not configured' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Invalid response from Gemini API');
    }

    res.json({ text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports.handler = serverless(app);
