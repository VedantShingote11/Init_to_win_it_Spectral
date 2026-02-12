from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)
CORS(app)

@app.route('/transcript', methods=['GET'])
def get_transcript():
    video_id = request.args.get('video_id')

    if not video_id:
        return jsonify({'error': 'Missing video_id parameter'}), 400

    print(f"📺 Fetching transcript for video ID: {video_id}")

    try:
        api = YouTubeTranscriptApi()

        # Try English first, then Hindi, then any available language
        try:
            transcript = api.fetch(video_id, languages=['en', 'hi'])
        except:
            # If specific languages fail, try without language restriction
            print("   Trying without language restriction...")
            transcript = api.fetch(video_id)

        # Extract text from snippets
        script = " ".join([snippet.text for snippet in transcript.snippets])
        
        # Also create timestamps array
        timestamps = [
            {
                'time': snippet.start,
                'duration': snippet.duration,
                'text': snippet.text
            }
            for snippet in transcript.snippets
        ]

        print(f"✅ Successfully fetched transcript")
        print(f"   Language: {transcript.language} ({transcript.language_code})")
        print(f"   Segments: {len(transcript.snippets)}")
        print(f"   Auto-generated: {transcript.is_generated}")

        return jsonify({
            "success": True,
            "video_id": transcript.video_id,
            "language": transcript.language,
            "language_code": transcript.language_code,
            "is_generated": transcript.is_generated,
            "transcript": script,
            "timestamps": timestamps,
            "segment_count": len(transcript.snippets)
        })

    except Exception as e:
        error_message = str(e)
        print(f"❌ Error fetching transcript: {error_message}")
        
        return jsonify({
            "success": False,
            "error": f"Failed to fetch transcript: {error_message}"
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'youtube-transcript-service'})

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint with a known working video"""
    test_video_id = 'dQw4w9WgXcQ'  # Rick Astley - Never Gonna Give You Up
    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(test_video_id, languages=['en'])
        return jsonify({
            'status': 'working',
            'test_video': test_video_id,
            'segments_found': len(transcript.snippets),
            'language': transcript.language
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting YouTube Transcript Service on port 5001...")
    print("📝 Test endpoint: http://localhost:5001/test")
    print("📝 Health check: http://localhost:5001/health")
    print("✨ Using fetch() API method for better compatibility")
    app.run(host='0.0.0.0', port=5001, debug=True)

