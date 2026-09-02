# Setup ProjectAccelerator.mifeco.com

## Step 1: Create CloudFront Distribution

```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Step 2: Get CloudFront Domain

After creation, get the CloudFront domain (e.g., `d111111abcdef8.cloudfront.net`)

```bash
aws cloudfront list-distributions --query "DistributionList.Items[0].DomainName"
```

## Step 3: Add DNS Record

Go to your DNS provider (where mifeco.com is hosted) and add:

**Type**: CNAME  
**Name**: ProjectAccelerator  
**Value**: `d111111abcdef8.cloudfront.net` (from Step 2)  
**TTL**: 300

## Step 4: Request SSL Certificate

```bash
aws acm request-certificate --domain-name ProjectAccelerator.mifeco.com --validation-method DNS --region us-east-1
```

Verify the certificate by adding the DNS validation record provided.

## Step 5: Update CloudFront with Custom Domain

Once certificate is validated, update CloudFront distribution to use:
- Alternate Domain Names: `ProjectAccelerator.mifeco.com`
- SSL Certificate: (select the ACM certificate from Step 4)

---

## Quick Method (Manual via AWS Console)

1. Go to AWS CloudFront Console
2. Create Distribution:
   - Origin: `project-management-app-12847.s3-website-us-east-1.amazonaws.com`
   - Alternate Domain: `ProjectAccelerator.mifeco.com`
   - SSL: Request certificate for `ProjectAccelerator.mifeco.com`
3. Add CNAME in your DNS: `ProjectAccelerator` → CloudFront domain
4. Wait 15-20 minutes for deployment

**Cost**: ~$0.50/month (includes HTTPS + global CDN)
