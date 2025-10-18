# AWS SES Setup Instructions

## Overview
AWS Simple Email Service (SES) is now integrated for sending emails. Follow these steps to activate and configure it.

## Step 1: Verify Your Email Address (Required)

### For Development/Testing (Sandbox Mode)
1. Go to AWS Console: https://console.aws.amazon.com/ses/
2. Select your region (e.g., us-east-1)
3. Click **Verified identities** in left menu
4. Click **Create identity**
5. Select **Email address**
6. Enter: `noreply@mifeco.com` (or your desired sender email)
7. Click **Create identity**
8. Check your email inbox for verification email
9. Click the verification link

### Verify Recipient Emails (Sandbox Mode Only)
In sandbox mode, you can only send to verified emails:
1. Repeat steps above for each recipient email
2. Or request production access (see Step 3)

## Step 2: Configure Environment Variables

Add to `.env.local`:
```env
# AWS Credentials (same as Bedrock if already configured)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# SES Configuration
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@mifeco.com
FROM_EMAIL=noreply@mifeco.com
```

## Step 3: Request Production Access (Optional)

### Why Request Production Access?
- **Sandbox Mode**: Can only send to verified emails (max 200/day)
- **Production Mode**: Can send to any email (50,000/day default)

### How to Request
1. Go to AWS SES Console
2. Click **Account dashboard** in left menu
3. Click **Request production access** button
4. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: http://mifeco.com
   - **Use case description**:
     ```
     Project management application sending automated notifications:
     - Password reset emails
     - Task assignment notifications
     - Project status updates
     - Account deletion confirmations
     
     Expected volume: 100-500 emails/day
     Recipients: Registered users who opted in
     ```
   - **Compliance**: Confirm you comply with AWS policies
5. Submit request
6. Wait 24-48 hours for approval

## Step 4: Install Dependencies

```bash
cd server
npm install
```

This installs `@aws-sdk/client-ses` package.

## Step 5: Test Email Sending

### Start Backend
```bash
cd server
npm start
```

### Test via API
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-verified-email@example.com",
    "subject": "Test Email",
    "body": "<p>This is a test email from AWS SES</p>"
  }'
```

### Test Password Reset
1. Register a user with a verified email
2. Click "Forgot Password?"
3. Enter your email
4. Check inbox for reset email

## Step 6: Monitor Email Sending

### View Sent Emails
1. Go to AWS SES Console
2. Click **Sending statistics** in left menu
3. View delivery rates, bounces, complaints

### Check Logs
Backend logs show email status:
```
Email sent to user@example.com: Password Reset Request
```

Or if SES not configured:
```
=== EMAIL (No SES configured) ===
To: user@example.com
Subject: Password Reset Request
==================
```

## Troubleshooting

### Error: "Email address is not verified"
**Solution**: Verify the sender email in SES Console (Step 1)

### Error: "MessageRejected: Email address is not verified"
**Solution**: 
- In sandbox mode, verify recipient email too
- Or request production access (Step 3)

### Error: "Missing credentials"
**Solution**: Check `.env.local` has correct AWS credentials

### Error: "AccessDenied"
**Solution**: IAM user needs `ses:SendEmail` permission:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ses:SendEmail", "ses:SendRawEmail"],
    "Resource": "*"
  }]
}
```

### Emails Not Arriving
1. Check spam/junk folder
2. Check SES sending statistics for bounces
3. Verify email address is correct
4. Check backend logs for errors

## Cost Estimate

### Free Tier
- 62,000 emails/month when sent from EC2
- First 1,000 emails/month free otherwise

### After Free Tier
- $0.10 per 1,000 emails
- Example: 10,000 emails/month = $1.00

## Security Best Practices

1. **Use IAM Role** (if running on EC2):
   - Don't use access keys
   - Attach IAM role with SES permissions to EC2 instance

2. **Rotate Credentials**:
   - Rotate AWS access keys every 90 days

3. **Limit Permissions**:
   - Only grant `ses:SendEmail` permission
   - Don't use root account credentials

4. **Monitor Usage**:
   - Set up CloudWatch alarms for unusual sending patterns
   - Monitor bounce and complaint rates

## Alternative: Use SES SMTP

If you prefer SMTP instead of SDK:

1. Get SMTP credentials from SES Console
2. Use nodemailer:
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USERNAME,
    pass: process.env.SES_SMTP_PASSWORD
  }
});

await transporter.sendMail({
  from: process.env.FROM_EMAIL,
  to: recipient,
  subject: subject,
  html: body
});
```

## Current Implementation Status

✅ AWS SES SDK integrated in backend
✅ Fallback to console logging if SES not configured
✅ Frontend calls backend API for email sending
✅ Password reset emails
✅ Account deletion emails
✅ Task notification emails
✅ Agent start/complete emails

## Next Steps

1. Verify sender email in SES Console
2. Add AWS credentials to `.env.local`
3. Test email sending
4. Request production access (optional)
5. Monitor email delivery rates
