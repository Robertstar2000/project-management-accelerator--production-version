# Stripe Payment Integration Setup

## Step 1: Create Payment Links

1. Go to https://dashboard.stripe.com/test/payment-links
2. Click "New" to create each payment link:

### Starter Plan
- **Name**: Starter Plan - 2 Projects/Month
- **Price**: $10.00 USD
- **Billing**: Recurring - Monthly
- **Description**: Get 2 additional projects first month, then 2 projects per month
- Click "Create link" and copy the URL

### Pro Plan
- **Name**: Pro Plan - 4 Projects
- **Price**: $20.00 USD
- **Billing**: Recurring - Monthly
- **Description**: Get 4 additional projects with priority support
- Click "Create link" and copy the URL

### Unlimited Plan
- **Name**: Unlimited Plan
- **Price**: $100.00 USD
- **Billing**: Recurring - Monthly
- **Description**: Unlimited projects with priority support
- Click "Create link" and copy the URL

## Step 2: Update Payment Links in Code

Edit `src/components/UpgradeModal.tsx` and replace the placeholder URLs:

```typescript
case 'starter':
    url = 'YOUR_STARTER_PAYMENT_LINK_HERE';
    break;
case 'pro':
    url = 'YOUR_PRO_PAYMENT_LINK_HERE';
    break;
case 'unlimited':
    url = 'YOUR_UNLIMITED_PAYMENT_LINK_HERE';
    break;
```

## Step 3: Set Up Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `http://localhost:3001/api/stripe/webhook` (for testing)
   - For production, use your deployed backend URL
4. **Events to listen to**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Update `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

## Step 4: Test the Integration

1. Restart backend server: `cd server && node index.js`
2. Restart frontend: `npm run dev`
3. Create 3 projects to hit the limit
4. Click "Start Working" - you should see the upgrade modal
5. Click a plan button - it opens Stripe payment page
6. Use test card: `4242 4242 4242 4242`, any future date, any CVC
7. Complete payment
8. Webhook updates user's project limit automatically

## Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

## Backdoor User for Testing

- **Email**: mifecoinc@gmail.com
- **Password**: Rm2214ri#
- **Limit**: Unlimited projects (no payment required)

## Production Deployment

1. Create production payment links in live mode
2. Update webhook URL to production backend
3. Update `.env.local` with live Stripe keys
4. Test with real payment methods
