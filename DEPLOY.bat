@echo off
echo Building production app...
call npm run build

echo Deploying to S3...
aws s3 sync dist/ s3://project-management-app-12847 --delete

echo Done! Visit: http://project-management-app-12847.s3-website-us-east-1.amazonaws.com/
