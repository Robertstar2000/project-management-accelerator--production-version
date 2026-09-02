# Quick Start Guide

## Get AI Working in 5 Minutes

### Option 1: Google Gemini (Recommended - Works in Browser)

**Cost**: Free for 15 requests/minute

1. **Get API Key** (1 minute)
   - Go to https://aistudio.google.com/apikey
   - Click "Create API Key"

2. **Configure App** (1 minute)
   - Edit `.env.local`:
     ```
     GEMINI_API_KEY=AIza...
     ```

3. **Run**
   ```bash
   npm install
   npm run dev
   ```

### Option 2: AWS Bedrock (Requires Backend Server)

**Cost**: ~$0.01-0.05 per project

⚠️ **Note**: AWS SDK doesn't work in browser. See [AWS_BROWSER_ISSUE.md](AWS_BROWSER_ISSUE.md) for backend setup.

## What You Get

✅ AI-powered project document generation
✅ Automatic task breakdown
✅ Risk analysis
✅ Project tracking tools
✅ Gantt charts & Kanban boards

## First Steps After Setup

1. **Create Account** - Register when app opens
2. **Create Project** - Click "New Project"
3. **Generate Documents** - AI creates planning docs
4. **Track Progress** - Use built-in tools

## Need Help?

- **AWS Setup**: See [AWS_SETUP_GUIDE.md](AWS_SETUP_GUIDE.md)
- **Security Fixes**: See [SECURITY_FIXES.md](SECURITY_FIXES.md)
- **Code Quality**: See [CODE_QUALITY_IMPROVEMENTS.md](CODE_QUALITY_IMPROVEMENTS.md)

## Troubleshooting

### "API Key Invalid" Error
- **AWS**: Check credentials in `.env.local`
- **Gemini**: Verify key at https://aistudio.google.com/apikey

### "Model Not Found" Error
- **AWS**: Enable Claude 3 Haiku in Bedrock console
- **Gemini**: Check API key permissions

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Cost Estimates

### AWS Bedrock (Claude 3 Haiku)
- Small project (5 docs): ~$0.01
- Medium project (15 docs): ~$0.03
- Large project (30 docs): ~$0.05

### Google Gemini
- Free tier: 15 requests/min
- Paid: Similar to AWS pricing
- Best for: Development/testing

## Pro Tips

💡 **Use AWS for production** - More reliable, better enterprise support
💡 **Use Gemini for dev** - Free tier great for testing
💡 **Set billing alerts** - Avoid surprise costs
💡 **Monitor usage** - Check AWS Cost Explorer regularly
