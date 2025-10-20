@echo off
echo ========================================
echo Testing Email and Stripe Integration
echo ========================================
echo.

echo 1. Testing Email Send...
node test-email-send.js
echo.

echo 2. Opening Stripe Test Page...
echo    - Click "Pay $0.01" button
echo    - Use test card: 4242 4242 4242 4242
echo    - Any future expiry date and CVC
start test-stripe.html
echo.

pause
