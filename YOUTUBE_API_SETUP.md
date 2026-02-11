# YouTube API Setup Guide

## Get Your Free YouTube Data API v3 Key

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Create a New Project
1. Click "Select a project" at the top
2. Click "NEW PROJECT"
3. Name it "SpectraX" or anything you like
4. Click "CREATE"

### Step 3: Enable YouTube Data API v3
1. In the search bar, type "YouTube Data API v3"
2. Click on "YouTube Data API v3"
3. Click "ENABLE"

### Step 4: Create API Credentials
1. Click "CREATE CREDENTIALS" button
2. Select "API key"
3. Your API key will be generated
4. **IMPORTANT**: Click "RESTRICT KEY" for security
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "SAVE"

### Step 5: Copy Your API Key
1. Copy the API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
2. Add it to your `.env` file:

```bash
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 6: Restart Backend
```bash
# The server should auto-restart with nodemon
# If not, manually restart:
npm run dev
```

## Usage Limits

**Free Tier:**
- 10,000 quota units per day
- Each caption list request = 50 units
- Each caption download = 200 units
- **You can process ~40 videos per day for free**

## Benefits of YouTube Data API v3

✅ More reliable than third-party libraries
✅ Access to auto-generated captions
✅ Better language support
✅ Official Google API with better uptime
✅ Can access captions even when not publicly visible

## Troubleshooting

**Error: "The request cannot be completed because you have exceeded your quota"**
- You've hit the daily limit (10,000 units)
- Wait until midnight Pacific Time for quota reset
- Or upgrade to paid tier (unlikely needed for personal use)

**Error: "API key not valid"**
- Make sure you copied the full API key
- Check that YouTube Data API v3 is enabled
- Verify the key is restricted to YouTube Data API v3

**Error: "captions.download requires authentication"**
- This means the video's captions require OAuth
- The video owner has restricted caption access
- Try a different video with public captions
