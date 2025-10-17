# Backend Setup Guide

## Overview
The backend server provides:
- AWS Bedrock (Claude 3 Haiku) proxy to bypass browser CORS restrictions
- Centralized authentication storage (in-memory)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This installs both frontend and backend dependencies.

### 2. Configure Environment Variables
Edit `.env.local` with your AWS credentials:

```env
# AWS Bedrock Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Google Gemini Fallback (optional)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### 3. Start the Application
```bash
npm run dev
```

This single command:
- Installs backend dependencies (if needed)
- Starts the Express backend on `http://localhost:3001`
- Starts the Vite frontend on `http://localhost:5173`

## Architecture

### Backend Server (`server/index.js`)
- **Port**: 3001
- **Framework**: Express.js
- **Endpoints**:
  - `POST /api/bedrock/generate` - AWS Bedrock proxy
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/projects/:username` - Get user projects
  - `POST /api/auth/projects/:username` - Save user projects

### Frontend (`src/`)
- **Port**: 5173 (Vite dev server)
- **AI Service**: Automatically tries AWS Bedrock first, falls back to Gemini
- **Auth Service**: Uses backend API for authentication

## AI Provider Priority

1. **AWS Bedrock** (default) - Lowest cost, requires backend
2. **User's Gemini Key** - Free tier, works in browser
3. **Environment Gemini Key** - Fallback option
4. **No AI** - Manual mode only

## Troubleshooting

### Backend Not Starting
- Check if port 3001 is available
- Verify AWS credentials in `.env.local`
- Check backend logs in terminal

### AWS Bedrock Errors
- Verify AWS credentials are correct
- Ensure AWS account has Bedrock access enabled
- Check AWS region supports Claude 3 Haiku

### Authentication Issues
- Backend uses in-memory storage (resets on restart)
- For production, replace with database (PostgreSQL, MongoDB, etc.)

## Production Deployment

### Backend Options
1. **AWS Lambda** - Serverless, auto-scaling
2. **AWS ECS/Fargate** - Containerized deployment
3. **Vercel/Netlify Functions** - Serverless edge functions
4. **Traditional VPS** - DigitalOcean, Linode, etc.

### Database Migration
Replace in-memory storage with:
- PostgreSQL (recommended)
- MongoDB
- DynamoDB (AWS native)

### Environment Variables
Set production environment variables in your hosting platform.
