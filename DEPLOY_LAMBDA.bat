@echo off
echo ========================================
echo Deploying Lambda with DynamoDB & SES
echo ========================================

cd lambda

echo.
echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Deploying to AWS...
call serverless deploy --verbose

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Copy the API endpoint URL from above
echo Then update .env.local with:
echo VITE_BACKEND_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
echo.
pause
