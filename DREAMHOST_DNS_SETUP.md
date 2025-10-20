# DreamHost DNS Setup for project.mifeco.com

## Goal
Point `http://www.project.mifeco.com` to your AWS S3 bucket: `project-management-app-12847.s3-website-us-east-1.amazonaws.com`

## Steps in DreamHost Panel

### 1. Login to DreamHost
- Go to: https://panel.dreamhost.com/
- Login with your credentials

### 2. Navigate to DNS Settings
- Click **Domains** in left sidebar
- Click **Manage Domains**
- Find `mifeco.com` and click **DNS** button

### 3. Add CNAME Record for project.mifeco.com
Click **Add Record** and enter:

```
Type: CNAME
Name: project
Value: project-management-app-12847.s3-website-us-east-1.amazonaws.com
```

**Important:** 
- Use `project` NOT `project.mifeco.com` (DreamHost adds the domain automatically)
- Do NOT include `http://` in the value
- Do NOT add a trailing dot

### 4. Add CNAME Record for www.project.mifeco.com
Click **Add Record** again and enter:

```
Type: CNAME
Name: www.project
Value: project-management-app-12847.s3-website-us-east-1.amazonaws.com
```

### 5. Save Changes
- Click **Add Record** for each entry
- DNS propagation takes 5-30 minutes

## Verify Setup

After 5-30 minutes, test:

```bash
# Check DNS resolution
nslookup project.mifeco.com
nslookup www.project.mifeco.com

# Test HTTP access
curl -I http://project.mifeco.com
curl -I http://www.project.mifeco.com
```

Both should resolve to S3 and return HTTP 200.

## Expected Result

✅ `http://project.mifeco.com` → Works  
✅ `http://www.project.mifeco.com` → Works  

Both will redirect to your S3 bucket and load the app.

## Troubleshooting

**If DNS doesn't resolve after 30 minutes:**
1. Check you used `project` not `project.mifeco.com` as the name
2. Verify no typos in the S3 endpoint
3. Clear your DNS cache: `ipconfig /flushdns` (Windows)
4. Try from a different network/device

**If you get "Bucket does not exist" error:**
- The S3 bucket name must match the domain exactly
- You may need to create a new bucket named `project.mifeco.com`
- Or use CloudFront distribution instead (see below)

## Alternative: CloudFront (For HTTPS)

If you want HTTPS (`https://www.project.mifeco.com`), you need CloudFront:

1. Create CloudFront distribution pointing to S3 bucket
2. Add SSL certificate via AWS Certificate Manager
3. Point CNAME to CloudFront domain instead of S3

This is more complex but provides HTTPS support.

## Current URLs

**Direct S3 Access:**  
http://project-management-app-12847.s3-website-us-east-1.amazonaws.com/

**After DNS Setup:**  
http://project.mifeco.com/  
http://www.project.mifeco.com/

## Notes

- HTTP only (no HTTPS) with direct S3 hosting
- For HTTPS, use CloudFront + ACM certificate
- DNS changes are not instant (5-30 min propagation)
- Some ISPs cache DNS longer (up to 24 hours)
