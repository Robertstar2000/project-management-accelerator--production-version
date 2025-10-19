@echo off
echo Getting Lambda API URL...
cd lambda
call serverless info --verbose
pause
