# AWS Bedrock Setup Guide

## Why AWS Bedrock?

- **Lower Cost**: Claude 3 Haiku costs ~$0.25 per million input tokens (vs Gemini's pricing)
- **No API Key Management**: Uses AWS credentials
- **Enterprise Ready**: Better for production deployments
- **Fast**: Haiku model optimized for speed

## Setup Steps

### 1. Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process

### 2. Enable AWS Bedrock
1. Log into AWS Console
2. Search for "Bedrock" in the services search
3. Click "Get Started" if prompted
4. Go to "Model access" in the left sidebar
5. Click "Enable specific models"
6. Enable "Claude 3 Haiku" by Anthropic
7. Wait for approval (usually instant)

### 3. Create IAM User for API Access
1. Go to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Username: `bedrock-api-user`
4. Click "Next"
5. Select "Attach policies directly"
6. Search and select: `AmazonBedrockFullAccess`
7. Click "Next" → "Create user"

### 4. Generate Access Keys
1. Click on the newly created user
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT**: Copy both:
   - Access key ID
   - Secret access key
   (You won't see the secret again!)

### 5. Configure Your Application

Edit `.env.local` file:

```env
# AWS Bedrock Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# Optional: Keep Gemini as backup
# GEMINI_API_KEY=your-gemini-key-here
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Application

```bash
npm run dev
```

## Cost Comparison

### Claude 3 Haiku (AWS Bedrock)
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- **Typical project generation**: ~$0.01-0.05

### Google Gemini 1.5 Flash
- Free tier: 15 requests/minute
- Paid: $0.075 per million input tokens
- **Typical project generation**: ~$0.005-0.03

## Model Selection

The app uses **Claude 3 Haiku** by default:
- Fastest Claude model
- Lowest cost
- Great for structured outputs
- 200K context window

To change models, edit `src/utils/awsBedrockService.ts`:

```typescript
// Options:
this.modelId = 'anthropic.claude-3-haiku-20240307-v1:0';    // Fastest, cheapest
this.modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';   // Balanced
this.modelId = 'anthropic.claude-3-opus-20240229-v1:0';     // Most capable
```

## Fallback Strategy

The app tries AI services in this order:
1. **AWS Bedrock** (if credentials configured)
2. **User's Gemini Key** (if saved)
3. **Environment Gemini Key** (if configured)
4. **No AI** (manual mode)

## Security Best Practices

### For Development
- Use `.env.local` (already in .gitignore)
- Never commit credentials to git

### For Production
- Use AWS IAM roles instead of access keys
- Use AWS Secrets Manager
- Enable CloudWatch logging
- Set up billing alerts

## Troubleshooting

### "Access Denied" Error
- Verify IAM user has `AmazonBedrockFullAccess` policy
- Check model access is enabled in Bedrock console
- Verify region matches (us-east-1)

### "Model Not Found" Error
- Go to Bedrock console → Model access
- Enable Claude 3 Haiku model
- Wait for approval status

### "Invalid Credentials" Error
- Double-check access key ID and secret
- Ensure no extra spaces in .env.local
- Regenerate keys if needed

### High Costs
- Monitor usage in AWS Cost Explorer
- Set up billing alerts
- Consider using Gemini free tier for development

## Monitoring Costs

1. Go to AWS Console → Billing Dashboard
2. Click "Cost Explorer"
3. Filter by service: "Bedrock"
4. Set up alerts:
   - Billing → Budgets
   - Create budget for Bedrock
   - Set threshold (e.g., $10/month)

## Support

- AWS Bedrock Docs: https://docs.aws.amazon.com/bedrock/
- Claude API Docs: https://docs.anthropic.com/claude/reference/
- Pricing: https://aws.amazon.com/bedrock/pricing/
