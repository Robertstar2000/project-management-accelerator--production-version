# AWS SDK Browser Limitation

## Issue
AWS SDK for JavaScript v3 has CORS restrictions when used directly in the browser. The Bedrock API calls are being blocked.

## Quick Fix: Use Gemini Instead

Since AWS Bedrock requires a backend server, use Google Gemini for now:

### Setup Gemini (2 minutes):

1. Get free API key: https://aistudio.google.com/apikey
2. Edit `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSyC_MNzqGKLU8CAUItbUV_hjgRQEFaLLegc
   ```
3. Restart app: `npm run dev`

## Proper AWS Solution (Requires Backend)

To use AWS Bedrock properly, you need a backend server:

### Option 1: Add Express Backend (Recommended)

Create `server.js`:
```javascript
import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const app = express();
app.use(express.json());

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({ text: result.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Backend running on :3001'));
```

Then update `awsBedrockService.ts` to call your backend instead.

### Option 2: Use AWS Lambda + API Gateway

Deploy a Lambda function that calls Bedrock and expose it via API Gateway.

### Option 3: Use Vercel/Netlify Functions

Deploy serverless functions that proxy Bedrock requests.

## Why This Happens

1. **CORS**: AWS services don't allow direct browser calls for security
2. **Credentials**: Exposing AWS credentials in browser is insecure
3. **Best Practice**: Always use backend for AWS SDK calls

## Recommendation

**For this project**: Use Gemini (free tier, works in browser)
**For production**: Add backend server with AWS Bedrock

## Current Status

The app is configured to:
1. Try AWS Bedrock (will fail in browser)
2. Fallback to Gemini automatically ✅

Just configure Gemini and it will work!
