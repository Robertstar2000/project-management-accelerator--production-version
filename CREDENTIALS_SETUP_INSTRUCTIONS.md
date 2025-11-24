
### AWS Credentials 
1. Go to: https://console.aws.amazon.com/iam/home#/security_credentials
2. Delete/Deactivate ALL old keys
3. Create NEW access key
4. Copy the Access Key ID and Secret Access Key

### Secure Google Gemini API Key Setup
1. Go to: https://aistudio.google.com/apikey
2. Create new key if needed
3. The API key is now securely stored in AWS Secrets Manager
4. **IMPORTANT**: After deploying your SAM stack, update the secret value:
   ```bash
   aws secretsmanager put-secret-value \
     --secret-id project-management-gemini-api-key \
     --secret-string "YOUR_ACTUAL_GEMINI_API_KEY_HERE"
   ```

### Stripe Keys (COMPROMISED - Rotate NOW)
1. Go to: https://dashboard.stripe.com/apikeys
2. Roll/regenerate ALL keys (both test and live)
3. Copy new Secret Key and Publishable Key

## Step 2: Update .env.local File

Open: `project-management-accelerator,-production-version\.env.local`

Replace with your NEW credentials:

```bash
>

# Backend API URL
VITE_BACKEND_URL=https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod

# Google Gemini API Key


# Stripe Configuration


# Project Limits
DEFAULT_PROJECT_LIMIT=6
BASIC_PROJECT_LIMIT=2
PRO_PROJECT_LIMIT=4
UNLIMITED_PROJECT_LIMIT=-1
BACKDOOR_USER_EMAIL=mifecoinc@gmail.com

# AWS SES Email Configuration
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=WEBMAIL@mifeco.com
FROM_EMAIL=WEBMAIL@mifeco.com
FRONTEND_URL=http://localhost:5173
```

## Step 3: Update lambda/.env File

Open: `project-management-accelerator,-production-version\lambda\.env`

Replace with your NEW credentials:

```bash
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_ACCESS_KEY=<paste_new_aws_access_key_here>
AWS_BEDROCK_SECRET_KEY=<paste_new_aws_secret_key_here>
JWT_SECRET=8f3a9c2e7b1d4f6a5e8c9b2d7f4a6e1c3b5d8f2a9c7e4b6d1f3a8c5e7b9d2f4a
STRIPE_SECRET_KEY=<paste_new_stripe_secret_key_here>
STRIPE_WEBHOOK_SECRET=<paste_webhook_secret_here>
DEFAULT_PROJECT_LIMIT=6
BACKDOOR_USER_EMAIL=mifecoinc@gmail.com
FRONTEND_URL=http://localhost:5173
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=WEBMAIL@mifeco.com
FROM_EMAIL=WEBMAIL@mifeco.com
```

## Step 4: Verify Files Are NOT in Git

Run:
```bash
git status
```

You should see:
- `.env.local` - NOT listed (ignored)
- `lambda/.env` - NOT listed (ignored)

## Step 5: NEVER Share These Files

❌ NEVER:
- Commit to git
- Share in chat/email
- Post in support tickets
- Upload to cloud storage
- Screenshot and share

✅ ONLY:
- Keep on your local machine
- Store in password manager
- Share via secure credential vault (if needed)

## Step 6: Clean Up This Conversation

After setting up credentials:
1. Clear this chat history
2. Close any screenshots
3. Delete any temporary files with credentials
