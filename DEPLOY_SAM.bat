@echo off
echo ========================================
echo Deploying Lambda with AWS SAM
echo ========================================

cd lambda

echo.
echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building SAM application...
call sam build

echo.
echo Step 3: Deploying to AWS...
call sam deploy --stack-name project-management-backend --capabilities CAPABILITY_IAM --region us-east-1

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo The API URL will be shown above as "ApiUrl"
echo Copy it and update .env.local with:
echo VITE_BACKEND_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/Prod
echo.
pause
