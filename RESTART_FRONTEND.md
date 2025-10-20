# Fix: Frontend Still Using Old Backend

## Problem
Frontend is still hitting old backend even though `.env.local` was updated.

## Solution

**You must restart the dev server for environment variables to take effect!**

### Steps:

1. **Stop the current dev server**
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Start it again**
   ```bash
   npm run dev
   ```

3. **Hard refresh browser**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Or `Cmd+Shift+R` (Mac)

4. **Try registering again**
   - Use: `Robertstar@aol.com` / `BobM`
   - Should now work with Lambda/DynamoDB

## Why This Happens

Vite loads environment variables **only on startup**. Changing `.env.local` while the dev server is running has no effect.

## Verify It's Working

After restarting, open browser console and check:
```javascript
console.log(import.meta.env.VITE_BACKEND_URL)
```

Should show:
```
https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod
```

If it shows `http://localhost:3001`, the dev server wasn't restarted properly.
