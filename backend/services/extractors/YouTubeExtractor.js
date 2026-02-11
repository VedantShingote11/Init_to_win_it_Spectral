const { YoutubeTranscript } = require('youtube-transcript');

class YouTubeExtractor {
    async extract(url) {
        try {
            // Extract video ID from URL
            const videoId = this.extractVideoId(url);

            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            console.log(`📺 Attempting to fetch transcript for video: ${videoId}`);

            // Use youtube-transcript library (doesn't require OAuth)
            let transcript;
            try {
                transcript = await YoutubeTranscript.fetchTranscript(videoId);
            } catch (error) {
                console.log('⚠️ Default transcript fetch failed, trying with language options...');
                try {
                    // Try with explicit English
                    transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                        lang: 'en'
                    });
                } catch (secondError) {
                    console.error('❌ Transcript fetch failed:', error.message);
                    throw error;
                }
            }

            if (!transcript || transcript.length === 0) {
                throw new Error('No transcript available for this video');
            }

            console.log(`✅ Successfully fetched ${transcript.length} transcript segments`);

            // Combine transcript segments
            const text = transcript.map(segment => segment.text).join(' ');

            // Store timestamps for reference
            const timestamps = transcript.map(segment => ({
                time: segment.offset,
                text: segment.text,
            }));

            return {
                text: text.trim(),
                metadata: {
                    videoId,
                    url,
                    timestamps,
                    duration: transcript[transcript.length - 1]?.offset || 0,
                    segmentCount: transcript.length,
                },
            };
        } catch (error) {
            console.error('❌ Error extracting YouTube transcript:', error);
            console.error('Error details:', error.message);

            // Provide helpful error messages
            if (error.message.includes('Could not') ||
                error.message.includes('Transcript') ||
                error.message.includes('No transcript available')) {
                throw new Error('This video does not have publicly accessible transcripts. Please try a video with captions/subtitles enabled.');
            }

            throw new Error(`YouTube extraction failed: ${error.message}`);
        }
    }

    extractVideoId(url) {
        // Support various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }
}

module.exports = new YouTubeExtractor();

