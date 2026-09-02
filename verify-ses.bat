@echo off
echo Verifying SES email addresses...
echo.

echo 1. Verifying FROM email: WEBMAIL@mifeco.com
aws ses verify-email-identity --email-address WEBMAIL@mifeco.com --region us-east-1

echo.
echo 2. Verifying TO email: robertstar2000@gmail.com
aws ses verify-email-identity --email-address robertstar2000@gmail.com --region us-east-1

echo.
echo ========================================
echo Check both email inboxes for verification links!
echo Click the links to verify, then run test again.
echo ========================================
pause
