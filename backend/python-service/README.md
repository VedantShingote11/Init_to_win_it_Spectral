# Python YouTube Transcript Service

This is a Flask microservice that provides YouTube transcript extraction functionality.

## Setup

1. **Install Python 3.8 or higher**

2. **Install dependencies:**
   ```bash
   cd backend/python-service
   pip install -r requirements.txt
   ```

3. **Run the service:**
   ```bash
   python app.py
   ```

   The service will start on `http://localhost:5001`

## API Endpoints

### GET /transcript
Fetch transcript for a YouTube video.

**Parameters:**
- `video_id` (required): YouTube video ID

**Example:**
```bash
curl "http://localhost:5001/transcript?video_id=dQw4w9WgXcQ"
```

**Response:**
```json
{
  "transcript": "Full transcript text...",
  "timestamps": [
    {"time": 0.0, "duration": 2.5, "text": "First segment"},
    {"time": 2.5, "duration": 3.0, "text": "Second segment"}
  ],
  "video_id": "dQw4w9WgXcQ",
  "segment_count": 150
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "youtube-transcript-service"
}
```

## Integration with Node.js Backend

The Node.js backend (`YouTubeExtractor.js`) calls this service to fetch transcripts.

## Troubleshooting

**Port already in use:**
```bash
# Change port in app.py:
app.run(host='0.0.0.0', port=5002, debug=True)
```

**Module not found:**
```bash
pip install -r requirements.txt
```
