<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fb3CGyuh9NQUlDcDgEYgZy_L4LGn9pMH

## Run Locally

**Prerequisites:**  Node.js

### Option 1: Google Gemini (Recommended - Works in Browser)

1. Install dependencies: `npm install`
2. Get free API key: https://aistudio.google.com/apikey
3. Set `GEMINI_API_KEY` in `.env.local`
4. Run the app: `npm run dev`

### Option 2: AWS Bedrock (Requires Backend Server)

1. Install dependencies: `npm install`
2. Configure AWS backend server (see [AWS_BROWSER_ISSUE.md](AWS_BROWSER_ISSUE.md))
3. Run the app: `npm run dev`

**Note**: AWS Bedrock requires a backend server (see [AWS_BROWSER_ISSUE.md](AWS_BROWSER_ISSUE.md)). The app will automatically fallback to Gemini which works directly in the browser.
