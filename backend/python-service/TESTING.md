# YouTube Transcript Service - Testing Guide

## Quick Test

1. **Start the Python service:**
   ```bash
   cd backend/python-service
   python app.py
   ```

2. **Test the service is working:**
   Open browser or use curl:
   ```bash
   # Health check
   curl http://localhost:5001/health
   
   # Test with known working video
   curl http://localhost:5001/test
   ```

3. **Test with specific video:**
   ```bash
   # Rick Astley (usually works)
   curl "http://localhost:5001/transcript?video_id=dQw4w9WgXcQ"
   
   # Your video
   curl "http://localhost:5001/transcript?video_id=YOUR_VIDEO_ID"
   ```

## Videos Known to Have Transcripts

Try these if your videos aren't working:

1. **Rick Astley - Never Gonna Give You Up**
   - URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ`

2. **Despacito (Most viewed video)**
   - URL: `https://www.youtube.com/watch?v=kJQP7kiw5Fk`
   - Video ID: `kJQP7kiw5Fk`

3. **Baby Shark**
   - URL: `https://www.youtube.com/watch?v=XqZsoesa55w`
   - Video ID: `XqZsoesa55w`

## Troubleshooting

### Issue: "no element found" error

**Causes:**
- Video doesn't have captions enabled
- Captions are auto-generated but not accessible via API
- Regional restrictions
- Video is too new (captions not generated yet)

**Solutions:**
1. Try a different video with confirmed captions
2. Check if captions are visible when you watch the video on YouTube
3. Try videos from major channels (they usually have captions)

### Issue: Service not starting

```bash
# Make sure dependencies are installed
pip install -r requirements.txt

# Try different port if 5001 is busy
# Edit app.py and change: app.run(port=5002)
```

### Issue: Node.js can't connect to Python service

1. **Check Python service is running:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Check .env configuration:**
   ```bash
   # In backend/.env
   PYTHON_SERVICE_URL=http://localhost:5001
   ```

3. **Restart Node.js backend:**
   ```bash
   cd backend
   npm run dev
   ```

## Integration Flow

```
Frontend Upload
    ↓
Node.js Backend (YouTubeExtractor.js)
    ↓
HTTP Request to Python Service (port 5001)
    ↓
Python calls youtube-transcript-api
    ↓
Returns transcript to Node.js
    ↓
Processes and stores in Qdrant
```

## Alternative: If Python Service Still Doesn't Work

The issue might be with the `youtube-transcript-api` library itself. YouTube frequently changes their API which breaks these libraries.

**Option 1: Use a different library**
```bash
pip install yt-dlp
```

**Option 2: Focus on PDF uploads**
Your PDF processing works perfectly - use that as the primary feature and treat YouTube as optional.

**Option 3: Manual transcript upload**
Add a feature where users can paste transcript text manually.
