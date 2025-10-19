@echo off
echo Building frontend...
call npm run build

set BUCKET_NAME=project-management-app-%RANDOM%
echo Creating S3 bucket: %BUCKET_NAME%
aws s3 mb s3://%BUCKET_NAME% --region us-east-1

echo Configuring bucket for static website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo Setting bucket policy for public access...
echo { "Version": "2012-10-17", "Statement": [{ "Sid": "PublicReadGetObject", "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::%BUCKET_NAME%/*" }]} > bucket-policy.json
aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy.json
del bucket-policy.json

echo Uploading files to S3...
aws s3 sync dist/ s3://%BUCKET_NAME% --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp dist/index.html s3://%BUCKET_NAME%/index.html --cache-control "no-cache"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo Website URL: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo To add CloudFront CDN (HTTPS + faster):
echo Run: deploy-cloudfront.bat %BUCKET_NAME%
echo ========================================
