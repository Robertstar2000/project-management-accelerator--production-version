# Lambda Authentication Fix

## Problem
Authentication not working in production Lambda because:
1. ✗ Lambda uses in-memory array - users lost on cold start
2. ✗ Missing password reset endpoints
3. ✗ Missing email sending endpoint  
4. ✗ Missing AWS SES integration
5. ✗ Frontend points to localhost, not Lambda URL

## Solution

### Step 1: Get Lambda API URL

```bash
cd lambda
serverless info
```

Look for output like:
```
endpoints:
  ANY - https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/{proxy+}
```

Copy this URL (without `/{proxy+}`)

### Step 2: Update Frontend to Point to Lambda

Edit `.env.local`:
```env
VITE_BACKEND_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Step 3: Add DynamoDB for User Storage

The Lambda needs DynamoDB instead of in-memory array.

**Option A: Quick Fix (Use server/users.json temporarily)**
- Copy `server/users.json` to Lambda
- Lambda reads/writes to this file
- ⚠️ Not ideal for production but works for testing

**Option B: Proper Fix (Use DynamoDB)**
- Create DynamoDB table for users
- Update Lambda to use DynamoDB
- Persistent storage across cold starts

### Step 4: Copy Missing Endpoints to Lambda

Lambda is missing these endpoints from `server/index.js`:
- `POST /api/auth/reset-password`
- `POST /api/auth/confirm-reset-password`
- `DELETE /api/auth/delete-account/:userId`
- `POST /api/send-email`
- AWS SES integration

## Quick Test

After getting Lambda URL and updating `.env.local`:

1. Rebuild frontend:
```bash
npm run build
```

2. Test locally first:
```bash
npm run dev
```

3. Try to register/login - should hit Lambda now

## Current Status

- ✅ Local server has all auth features
- ✗ Lambda missing auth features
- ✗ Frontend points to localhost
- ✗ No persistent storage in Lambda

## Recommendation

**Immediate**: Point frontend to local server for now
**Short-term**: Copy all endpoints from server/index.js to lambda/index.js
**Long-term**: Migrate to DynamoDB for user storage
