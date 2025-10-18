# Email Test Instructions

## Current Configuration
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- From Email: WEBMAIL@mifeco.com
- Test Email: mifecoinc@gmail.com

## Step 1: Verify Email in AWS SES

**IMPORTANT**: Before testing, verify WEBMAIL@mifeco.com in AWS SES Console:

1. Go to: https://console.aws.amazon.com/ses/
2. Select region: **us-east-1**
3. Click **Verified identities** → **Create identity**
4. Select **Email address**
5. Enter: **WEBMAIL@mifeco.com**
6. Click **Create identity**
7. Check email inbox and click verification link

## Step 2: Start Backend

Open a terminal and run:
```bash
cd server
npm start
```

You should see:
```
Backend server running on http://localhost:3001
```

## Step 3: Test Email Endpoint

Open another terminal and run:
```bash
node test-email.js
```

### Expected Results

**If SES is configured correctly:**
```
Response: 200 { message: 'Email sent successfully' }
✅ Email sent successfully!
Check mifecoinc@gmail.com inbox
```

**If WEBMAIL@mifeco.com is not verified:**
```
Response: 500 { error: '...' }
❌ Email failed: ...
```
→ Go back to Step 1 and verify the email

**If backend is not running:**
```
❌ Request failed: fetch failed
Make sure backend is running: cd server && npm start
```
→ Go back to Step 2

## Step 4: Check Email

1. Open mifecoinc@gmail.com inbox
2. Look for email with subject: "Test Email from AWS SES"
3. Check spam folder if not in inbox

## Troubleshooting

### Email Not Verified
**Error**: "Email address is not verified"
**Solution**: Verify WEBMAIL@mifeco.com in SES Console (Step 1)

### Sandbox Mode Restriction
**Error**: "MessageRejected: Email address is not verified"
**Solution**: In sandbox mode, verify recipient email too:
1. Go to SES Console
2. Verify mifecoinc@gmail.com
3. Check that email and click verification link

### Missing Credentials
**Error**: "Missing credentials"
**Solution**: Check .env.local has:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=WEBMAIL@mifeco.com
```

### Backend Not Running
**Error**: "fetch failed" or "ECONNREFUSED"
**Solution**: Start backend: `cd server && npm start`

## Test Password Reset Email

Once basic email works, test password reset:

1. Start frontend: `npm run dev`
2. Go to: http://localhost:3000
3. Click "Forgot Password?"
4. Enter: mifecoinc@gmail.com
5. Check inbox for reset email

## Production Access (Optional)

To send to any email (not just verified ones):

1. Go to SES Console → Account dashboard
2. Click "Request production access"
3. Fill form and submit
4. Wait 24-48 hours for approval

## Current Status

- ✅ AWS SES integrated in backend
- ✅ Email endpoint created: POST /api/send-email
- ✅ Frontend calls backend for emails
- ✅ Configuration in .env.local
- ⏳ Verify WEBMAIL@mifeco.com in SES Console
- ⏳ Test email sending
