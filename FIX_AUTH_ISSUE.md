# Fix Authentication Issue

## Problem
"Invalid email or password" but "Username or email already exists" on signup.

## Root Cause
You're trying to login with a user that exists in the **old local server** (server/users.json) but **NOT in DynamoDB** (production Lambda).

## Solution

### Option 1: Register New User (Recommended)
1. Use a **different email** to register
2. Example: `newuser@example.com` instead of your old email
3. This creates the user in DynamoDB

### Option 2: Clear Old Data and Re-register
1. Stop local server if running
2. Delete `server/users.json`
3. Clear browser localStorage:
   - Open browser DevTools (F12)
   - Go to Application tab → Storage → Local Storage
   - Click "Clear All"
4. Register with your original email again

### Option 3: Migrate Existing User to DynamoDB

If you want to keep your existing user, manually add to DynamoDB:

```bash
aws dynamodb put-item \
  --table-name project-management-users \
  --item '{
    "id": {"S": "user-YOUR_ID"},
    "username": {"S": "YOUR_USERNAME"},
    "email": {"S": "YOUR_EMAIL"},
    "password": {"S": "YOUR_PASSWORD"},
    "projectLimit": {"N": "3"},
    "projectCount": {"N": "0"}
  }'
```

## Why This Happened

**Before Lambda deployment:**
- Users stored in `server/users.json` (local file)
- Frontend pointed to `http://localhost:3001`

**After Lambda deployment:**
- Users stored in DynamoDB (cloud database)
- Frontend points to `https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod`
- Old users.json users don't exist in DynamoDB

## Verify It's Working

Test with a brand new email:

```javascript
// In browser console
fetch('https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: 'testuser123',
    email: 'test123@example.com',
    password: 'testpass123'
  })
}).then(r => r.json()).then(console.log)
```

Then login:
```javascript
fetch('https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test123@example.com',
    password: 'testpass123'
  })
}).then(r => r.json()).then(console.log)
```

Both should return status 200 with user data.

## Quick Fix

**Just use a new email address to register!**

The Lambda API is working perfectly (tested and confirmed). You just need to create a new account in the production database.
