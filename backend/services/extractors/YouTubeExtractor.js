const axios = require('axios');

class YouTubeExtractor {
    constructor() {
        this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    }

    async extract(url) {
        try {
            // Extract video ID from URL
            const videoId = this.extractVideoId(url);

            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            console.log(`📺 Attempting to fetch transcript for video: ${videoId}`);
            console.log(`🐍 Calling Python service at: ${this.pythonServiceUrl}`);

            // Call Python microservice
            const response = await axios.get(`${this.pythonServiceUrl}/transcript`, {
                params: { video_id: videoId },
                timeout: 30000 // 30 second timeout
            });

            // Check if request was successful
            if (!response.data || !response.data.success) {
                const errorMsg = response.data?.error || 'Invalid response from transcript service';
                throw new Error(errorMsg);
            }

            console.log(`✅ Successfully fetched transcript (${response.data.segment_count} segments)`);
            console.log(`   Language: ${response.data.language} (${response.data.language_code})`);
            console.log(`   Auto-generated: ${response.data.is_generated}`);

            return {
                text: response.data.transcript.trim(),
                metadata: {
                    videoId: response.data.video_id,
                    url,
                    language: response.data.language,
                    languageCode: response.data.language_code,
                    isGenerated: response.data.is_generated,
                    timestamps: response.data.timestamps || [],
                    segmentCount: response.data.segment_count || 0,
                },
            };
        } catch (error) {
            console.error('❌ Error extracting YouTube transcript:', error);

            // Check if it's a service connection error
            if (error.code === 'ECONNREFUSED') {
                throw new Error('YouTube transcript service is not running. Please start the Python service on port 5001.');
            }

            // Check if it's a timeout
            if (error.code === 'ECONNABORTED') {
                throw new Error('Transcript fetch timed out. The video might be too long or the service is slow.');
            }

            // Handle API errors from Python service
            if (error.response && error.response.data && error.response.data.error) {
                const apiError = error.response.data.error;

                if (apiError.includes('Could not retrieve') ||
                    apiError.includes('Transcript') ||
                    apiError.includes('not available')) {
                    throw new Error('This video does not have publicly accessible transcripts. Please try a video with captions/subtitles enabled.');
                }

                throw new Error(`YouTube extraction failed: ${apiError}`);
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
