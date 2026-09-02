import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
app.use(cors());

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
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === customerEmail);
        
        if (userIndex !== -1) {
          const amount = session.amount_total / 100;
          
          if (amount === 10) {
            users[userIndex].projectLimit = (users[userIndex].projectLimit || 3) + 2;
          } else if (amount === 20) {
            users[userIndex].projectLimit = (users[userIndex].projectLimit || 3) + 4;
          } else if (amount === 100) {
            users[userIndex].projectLimit = -1;
          }
          
          saveUsers(users);
          console.log(`Updated project limit for ${customerEmail}`);
        }
      }
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json({ limit: '10mb' }));

const DB_FILE = path.join(__dirname, 'users.json');
const RESET_TOKENS_FILE = path.join(__dirname, 'reset-tokens.json');

const getUsers = () => {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const DEFAULT_PROJECT_LIMIT = parseInt(process.env.DEFAULT_PROJECT_LIMIT) || 3;
const BACKDOOR_EMAIL = process.env.BACKDOOR_USER_EMAIL || 'mifecoinc@gmail.com';

const saveUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

const getResetTokens = () => {
  try {
    if (!fs.existsSync(RESET_TOKENS_FILE)) return [];
    return JSON.parse(fs.readFileSync(RESET_TOKENS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const saveResetTokens = (tokens) => {
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2));
};

const sesClient = new SESClient({ 
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const sendEmail = async (to, subject, html) => {
  const fromEmail = process.env.FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    console.log(`\n=== EMAIL (No SES configured) ===\nTo: ${to}\nSubject: ${subject}\n==================\n`);
    return true;
  }
  
  try {
    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } }
      }
    });
    
    await sesClient.send(command);
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('SES email error:', error.message);
    console.log(`\n=== EMAIL (SES failed) ===\nTo: ${to}\nSubject: ${subject}\n==================\n`);
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

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = getUsers();
    
    if (users.some(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const projectLimit = email === BACKDOOR_EMAIL ? -1 : DEFAULT_PROJECT_LIMIT;
    const newUser = { 
      id: `user-${Date.now()}`, 
      username, 
      email, 
      password,
      projectLimit,
      projectCount: 0
    };
    saveUsers([...users, newUser]);
    res.json({ id: newUser.id, username, email, projectLimit, projectCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (user && constantTimeCompare(user.password, password)) {
      return res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        projectLimit: user.projectLimit ?? DEFAULT_PROJECT_LIMIT,
        projectCount: user.projectCount ?? 0
      });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/limits', (req, res) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      projectLimit: user.projectLimit ?? DEFAULT_PROJECT_LIMIT,
      projectCount: user.projectCount ?? 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/increment-projects', (req, res) => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].projectCount = (users[userIndex].projectCount ?? 0) + 1;
    saveUsers(users);
    
    res.json({ projectCount: users[userIndex].projectCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/:userId/decrement-projects', (req, res) => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].projectCount = Math.max(0, (users[userIndex].projectCount ?? 0) - 1);
    saveUsers(users);
    
    res.json({ projectCount: users[userIndex].projectCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(200).json({ message: 'If email exists, reset link sent' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000;
    
    const tokens = getResetTokens();
    tokens.push({ userId: user.id, token, expiresAt });
    saveResetTokens(tokens);
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, please ignore this email.</p>`
    );
    
    res.json({ message: 'If email exists, reset link sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/confirm-reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const tokens = getResetTokens();
    const resetToken = tokens.find(t => t.token === token && t.expiresAt > Date.now());
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === resetToken.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    const updatedTokens = tokens.filter(t => t.token !== token);
    saveResetTokens(updatedTokens);
    
    sendEmail(
      users[userIndex].email,
      'Password Reset Successful',
      '<p>Your password has been successfully reset.</p>'
    );
    
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
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[userIndex];
    
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
          console.log(`Deleted Stripe customer for ${user.email}`);
        }
      } catch (stripeError) {
        console.error('Stripe deletion error:', stripeError.message);
      }
    }
    
    users.splice(userIndex, 1);
    saveUsers(users);
    
    const tokens = getResetTokens().filter(t => t.userId !== userId);
    saveResetTokens(tokens);
    
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
  const config = {
    region: process.env.AWS_REGION || 'us-east-1',
  };
  
  if (process.env.AWS_BEARER_TOKEN_BEDROCK) {
    config.credentials = {
      accessKeyId: 'BEARER_TOKEN',
      secretAccessKey: 'BEARER_TOKEN',
      sessionToken: process.env.AWS_BEARER_TOKEN_BEDROCK,
    };
  } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  
  return new BedrockRuntimeClient(config);
};

const client = getBedrockClient();

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

    const bedrockClient = getBedrockClient();
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({ text: responseBody.content[0].text });
  } catch (error) {
    console.error('Bedrock error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
