# Backend Server Setup

## Installation

```bash
cd server
npm install
```

## Configuration

Ensure `.env.local` in the root directory contains:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
```

## Run Server

```bash
npm start
```

Or with auto-reload:
```bash
npm run dev
```

Server runs on http://localhost:3001

## Usage

Frontend automatically calls this backend when using AWS Bedrock.
Credentials stay secure on the server and never expose to browser.
