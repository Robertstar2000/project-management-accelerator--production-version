# AWS Lambda Setup Guide

## Prerequisites
- AWS Account
- AWS CLI installed: `npm install -g aws-cli`
- AWS credentials configured: `aws configure`

## Step 1: Install Serverless Framework
```bash
npm install -g serverless
```

## Step 2: Create Lambda Project Structure
```bash
cd project-management-accelerator,-production-version
mkdir lambda
cd lambda
npm init -y
npm install express serverless-http @aws-sdk/client-bedrock-runtime cors dotenv stripe bcryptjs jsonwebtoken
```

## Step 3: Create Lambda Handler

Create `lambda/index.js`:
```javascript
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import your existing server code
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-netlify-app.netlify.app',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Copy all routes from server/index.js here
// ... (authentication routes, bedrock proxy, stripe webhook, etc.)

module.exports.handler = serverless(app);
```

## Step 4: Create serverless.yml

Create `lambda/serverless.yml`:
```yaml
service: project-management-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'prod'}
  memorySize: 512
  timeout: 30
  environment:
    AWS_BEDROCK_REGION: ${env:AWS_BEDROCK_REGION}
    AWS_BEDROCK_ACCESS_KEY: ${env:AWS_BEDROCK_ACCESS_KEY}
    AWS_BEDROCK_SECRET_KEY: ${env:AWS_BEDROCK_SECRET_KEY}
    JWT_SECRET: ${env:JWT_SECRET}
    STRIPE_SECRET_KEY: ${env:STRIPE_SECRET_KEY}
    STRIPE_WEBHOOK_SECRET: ${env:STRIPE_WEBHOOK_SECRET}
    DEFAULT_PROJECT_LIMIT: ${env:DEFAULT_PROJECT_LIMIT}
    BACKDOOR_USER_EMAIL: ${env:BACKDOOR_USER_EMAIL}
    FRONTEND_URL: ${env:FRONTEND_URL}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - bedrock:InvokeModel
          Resource: '*'

functions:
  api:
    handler: index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors:
            origin: ${env:FRONTEND_URL}
            credentials: true

plugins:
  - serverless-offline
```

## Step 5: Copy Server Code

Copy your routes from `server/index.js` into `lambda/index.js`:
```javascript
// Authentication routes
app.post('/api/auth/register', async (req, res) => { /* ... */ });
app.post('/api/auth/login', async (req, res) => { /* ... */ });
app.get('/api/auth/limits', authenticateToken, async (req, res) => { /* ... */ });
app.post('/api/auth/increment-project', authenticateToken, async (req, res) => { /* ... */ });
app.post('/api/auth/decrement-project', authenticateToken, async (req, res) => { /* ... */ });

// AWS Bedrock proxy
app.post('/api/bedrock/invoke', authenticateToken, async (req, res) => { /* ... */ });

// Stripe webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => { /* ... */ });
```

## Step 6: Handle File Storage (users.json)

Lambda is stateless, so move user storage to DynamoDB or S3:

### Option A: DynamoDB (Recommended)
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

Add to `serverless.yml`:
```yaml
resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-users-${self:provider.stage}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: username
            AttributeType: S
        KeySchema:
          - AttributeName: username
            KeyType: HASH
```

Update code to use DynamoDB instead of `users.json`.

### Option B: S3 (Simpler for migration)
Keep using JSON file but store in S3 bucket.

## Step 7: Create .env file

Create `lambda/.env`:
```
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_ACCESS_KEY=your_key
AWS_BEDROCK_SECRET_KEY=your_secret
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DEFAULT_PROJECT_LIMIT=3
BACKDOOR_USER_EMAIL=mifecoinc@gmail.com
FRONTEND_URL=https://your-app.netlify.app
```

## Step 8: Deploy to AWS

```bash
cd lambda
serverless deploy
```

This will output your API endpoint:
```
endpoints:
  ANY - https://abc123.execute-api.us-east-1.amazonaws.com/prod/{proxy+}
```

## Step 9: Update Frontend

Update `.env.local` in your frontend:
```
VITE_BACKEND_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

## Step 10: Update Netlify Environment Variables

In Netlify dashboard → Site settings → Environment variables:
```
VITE_BACKEND_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

Redeploy Netlify site.

## Cost Estimate

For 1000 requests/day:
- Lambda: $0.20/month (first 1M requests free)
- API Gateway: $3.50/month
- DynamoDB: $0.25/month (25 GB storage free)
- **Total: ~$4/month**

For 100 requests/day: **~$0.50/month**

## Testing Locally

```bash
cd lambda
npm install -D serverless-offline
serverless offline
```

Your API will run at `http://localhost:3000`

## Monitoring

View logs:
```bash
serverless logs -f api -t
```

## Alternative: Simpler Approach with AWS SAM

If Serverless Framework is too complex, use AWS SAM:

1. Install SAM CLI: `pip install aws-sam-cli`
2. Create `template.yaml`
3. Run `sam deploy --guided`

## Rollback

If issues occur:
```bash
serverless remove
```

This deletes all AWS resources.

## Next Steps

1. Set up custom domain (optional): `serverless-domain-manager` plugin
2. Add CloudWatch alarms for errors
3. Enable AWS X-Ray for tracing
4. Set up CI/CD with GitHub Actions
