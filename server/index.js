import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
