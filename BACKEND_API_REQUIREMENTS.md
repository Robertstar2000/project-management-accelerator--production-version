# Backend API Requirements for Password Reset & Account Deletion

## New API Endpoints Required

### 1. Password Reset Request
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
- `200 OK` - Reset email sent successfully
- `404 Not Found` - Email not found
- `500 Internal Server Error` - Failed to send email

**Implementation Requirements:**
1. Verify email exists in database
2. Generate secure reset token (UUID or JWT with expiration)
3. Store token in database with expiration time (e.g., 1 hour)
4. Send email with reset link: `http://mifeco.com/projectAccelerator/reset-password?token={token}`
5. Email should include:
   - Reset link with token
   - Expiration time
   - Security notice (if you didn't request this, ignore it)

**Email Service Integration:**
- Use SendGrid, AWS SES, or similar service
- Configure SMTP settings in backend environment variables
- Email template should be professional and branded

### 2. Password Reset Confirmation
**Endpoint:** `POST /api/auth/confirm-reset-password`

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
- `200 OK` - Password reset successful
- `400 Bad Request` - Invalid or expired token
- `500 Internal Server Error` - Failed to update password

**Implementation Requirements:**
1. Validate token exists and hasn't expired
2. Hash new password using bcrypt or similar
3. Update user password in database
4. Delete/invalidate reset token
5. Send confirmation email to user

### 3. Account Deletion
**Endpoint:** `DELETE /api/auth/delete-account/{userId}`

**Response:**
- `200 OK` - Account deleted successfully
- `404 Not Found` - User not found
- `500 Internal Server Error` - Failed to delete account

**Implementation Requirements:**
1. Verify user exists
2. Delete user from authentication database
3. Cancel Stripe subscription if exists:
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   const customer = await stripe.customers.list({ email: user.email });
   if (customer.data.length > 0) {
     await stripe.subscriptions.list({ customer: customer.data[0].id })
       .then(subs => subs.data.forEach(sub => stripe.subscriptions.cancel(sub.id)));
     await stripe.customers.del(customer.data[0].id);
   }
   ```
4. Delete all user-related data:
   - User profile
   - API keys
   - Usage logs
   - Any stored project metadata (if backend stores any)
5. Send confirmation email to user
6. Return success response

## Database Schema Updates

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_expires ON password_reset_tokens(expires_at);
```

## Environment Variables Required

```env
# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_key
# OR
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_access_key
AWS_SES_SECRET_KEY=your_secret_key
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Email Configuration
FROM_EMAIL=noreply@mifeco.com
FROM_NAME=Project Accelerator

# Frontend URL for reset links
FRONTEND_URL=http://mifeco.com/projectAccelerator

# Stripe
STRIPE_SECRET_KEY=sk_live_...
```

## Frontend Password Reset Flow

A new component is needed to handle the reset token from the URL:

**File:** `src/views/ResetPasswordView.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPasswordView: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/confirm-reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });
            
            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    if (success) {
        return <div>Password reset successful! Redirecting to login...</div>;
    }

    return (
        <div className="tool-card">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}
                <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <button type="submit" className="button button-primary">Reset Password</button>
            </form>
        </div>
    );
};
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting on password reset endpoint (e.g., 3 requests per hour per email)
2. **Token Security:** Use cryptographically secure random tokens
3. **Token Expiration:** Tokens should expire after 1 hour
4. **Email Verification:** Don't reveal if email exists or not (always return success)
5. **Password Strength:** Enforce minimum password requirements
6. **Account Deletion:** Require additional confirmation (user must type "DELETE")
7. **Audit Logging:** Log all password resets and account deletions

## Testing Checklist

- [ ] Password reset email is sent successfully
- [ ] Reset link works and updates password
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Account deletion removes user from database
- [ ] Account deletion cancels Stripe subscription
- [ ] Account deletion clears all user data
- [ ] Confirmation emails are sent for both operations
