@echo off
aws configure set aws_access_key_id YOUR_AWS_ACCESS_KEY_HERE
aws configure set aws_secret_access_key YOUR_AWS_SECRET_KEY_HERE
aws configure set default.region us-east-1
aws configure set default.output json
echo AWS CLI configured successfully!
