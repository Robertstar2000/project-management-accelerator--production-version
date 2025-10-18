# Password Reset & Account Deletion Setup

## Features Implemented

✅ Password reset via email confirmation
✅ Account deletion with Stripe subscription cancellation
✅ Account settings modal in user interface

## Backend Endpoints

### 1. Request Password Reset
```
POST /api/auth/reset-password
Body: { "email": "user@example.com" }
```

### 2. Confirm Password Reset
```
POST /api/auth/confirm-reset-password
Body: { "token": "reset-token", "newPassword": "newpass123" }
```

### 3. Delete Account
```
DELETE /api/auth/delete-account/:userId
```

## Current Implementation

### Email Service
Currently uses **console logging** for development. Emails are printed to the server console.

For production, integrate a real email service by replacing the `sendEmail` function in `server/index.js`:

**Option 1: SendGrid**
```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL,
    subject,
    html
  });
};
```

**Option 2: AWS SES**
```javascript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const ses = new SESClient({ region: process.env.AWS_SES_REGION });

const sendEmail = async (to, subject, html) => {
  await ses.send(new SendEmailCommand({
    Source: process.env.FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } }
    }
  }));
};
```

### Data Storage
- **Users**: `server/users.json`
- **Reset Tokens**: `server/reset-tokens.json` (auto-created)

Tokens expire after 1 hour and are automatically cleaned up after use.

## User Flow

### Password Reset
1. User clicks "Forgot Password?" on login screen
2. Enters email and submits
3. Backend generates secure token and logs email to console
4. User clicks reset link: `http://localhost:5173?token=xxx`
5. User enters new password
6. Password updated, token deleted

### Account Deletion
1. User clicks "Account" button in header
2. Views account information
3. Types "DELETE" to confirm
4. Backend:
   - Cancels Stripe subscriptions
   - Deletes Stripe customer
   - Removes user from database
   - Clears reset tokens
5. User logged out automatically

## Testing

### Test Password Reset
```bash
# Start backend
cd server
npm start

# In another terminal, test the endpoint
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check server console for reset link
# Copy token from link and test confirmation
curl -X POST http://localhost:3001/api/auth/confirm-reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_HERE","newPassword":"newpass123"}'
```

### Test Account Deletion
```bash
curl -X DELETE http://localhost:3001/api/auth/delete-account/user-123456789
```

## Environment Variables

Add to `.env.local`:
```env
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_key
DEFAULT_PROJECT_LIMIT=3
BACKDOOR_USER_EMAIL=mifecoinc@gmail.com
```

## Security Features

✅ Tokens expire after 1 hour
✅ Tokens are single-use (deleted after password reset)
✅ Email existence not revealed (always returns success)
✅ Stripe subscriptions cancelled before account deletion
✅ All user data removed on account deletion
✅ Confirmation required for account deletion (type "DELETE")

## Production Checklist

- [ ] Configure real email service (SendGrid/AWS SES)
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Configure `FROM_EMAIL` and `FROM_NAME`
- [ ] Test email delivery
- [ ] Test Stripe subscription cancellation
- [ ] Add rate limiting to reset endpoint
- [ ] Migrate from JSON files to database
- [ ] Set up email templates with branding
- [ ] Add password strength requirements
- [ ] Configure CORS for production domain
