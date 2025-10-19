@echo off
if "%1"=="" (
    echo Usage: deploy-cloudfront.bat BUCKET_NAME
    exit /b 1
)

set BUCKET_NAME=%1

echo Creating CloudFront distribution for %BUCKET_NAME%...

echo { "CallerReference": "%RANDOM%%RANDOM%", "Comment": "Project Management App", "Enabled": true, "Origins": { "Quantity": 1, "Items": [{ "Id": "S3-%BUCKET_NAME%", "DomainName": "%BUCKET_NAME%.s3.us-east-1.amazonaws.com", "S3OriginConfig": { "OriginAccessIdentity": "" }}]}, "DefaultRootObject": "index.html", "DefaultCacheBehavior": { "TargetOriginId": "S3-%BUCKET_NAME%", "ViewerProtocolPolicy": "redirect-to-https", "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"]}, "ForwardedValues": { "QueryString": false, "Cookies": { "Forward": "none" }}, "MinTTL": 0, "Compress": true, "TrustedSigners": { "Enabled": false, "Quantity": 0 }}, "CustomErrorResponses": { "Quantity": 1, "Items": [{ "ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 300 }]}} > cloudfront-config.json

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json > cloudfront-output.json

echo.
echo ========================================
echo CloudFront Distribution Created!
echo ========================================
echo It may take 15-20 minutes to deploy globally.
echo Check status: aws cloudfront list-distributions
echo ========================================

del cloudfront-config.json
