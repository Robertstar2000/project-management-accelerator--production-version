# AWS Frontend Deployment Guide

## Option 1: S3 Only (Cheapest - ~$0.10/month)

### Deploy:
```bash
deploy-to-aws.bat
```

This will:
1. Build your React app
2. Create an S3 bucket
3. Upload files
4. Configure static website hosting
5. Give you a public URL

**Output**: `http://project-management-app-XXXXX.s3-website-us-east-1.amazonaws.com`

**Pros**: Cheapest option
**Cons**: No HTTPS, no CDN

---

## Option 2: S3 + CloudFront (Recommended - ~$0.50/month)

### Step 1: Deploy to S3
```bash
deploy-to-aws.bat
```

### Step 2: Add CloudFront CDN
```bash
deploy-cloudfront.bat BUCKET_NAME
```
(Use the bucket name from Step 1 output)

**Pros**: 
- HTTPS included (free SSL)
- Global CDN (fast worldwide)
- Custom domain support

**Cons**: Takes 15-20 minutes to deploy globally

---

## Update Frontend Environment

After deployment, update `.env.local`:

```env
VITE_BACKEND_URL=https://n342noj3bk.execute-api.us-east-1.amazonaws.com/Prod
```

Then rebuild and redeploy:
```bash
npm run build
aws s3 sync dist/ s3://BUCKET_NAME --delete
```

---

## Update Lambda Backend

Update Lambda's `FRONTEND_URL` environment variable:

```bash
cd lambda
# Edit template.yaml and change FRONTEND_URL to your S3/CloudFront URL
sam build
sam deploy --stack-name project-management-backend --capabilities CAPABILITY_IAM --region us-east-1
```

---

## Cost Comparison (1000 visitors/month)

| Option | Monthly Cost | HTTPS | CDN | Speed |
|--------|-------------|-------|-----|-------|
| S3 Only | $0.10 | ❌ | ❌ | Slow |
| S3 + CloudFront | $0.50 | ✅ | ✅ | Fast |
| Netlify Free | $0 | ✅ | ✅ | Fast |
| AWS Amplify | $1-3 | ✅ | ✅ | Fast |

---

## Custom Domain (Optional)

### With CloudFront:
1. Get CloudFront distribution domain from AWS Console
2. Add CNAME record in your DNS: `app.yourdomain.com` → `d111111abcdef8.cloudfront.net`
3. Request SSL certificate in AWS Certificate Manager (free)
4. Update CloudFront distribution with custom domain

---

## Cleanup (Delete Everything)

```bash
# Delete S3 bucket
aws s3 rb s3://BUCKET_NAME --force

# Delete CloudFront distribution
aws cloudfront delete-distribution --id DISTRIBUTION_ID

# Delete Lambda stack
aws cloudformation delete-stack --stack-name project-management-backend
```

---

## Recommendation

**For Production**: Use S3 + CloudFront (~$0.50/month)
**For Development**: Use S3 Only (~$0.10/month) or keep Netlify free tier
