class ChunkingService {
    constructor() {
        this.chunkSize = 800; // Target tokens per chunk
        this.overlapSize = 150; // Overlap tokens
        this.avgCharsPerToken = 4; // Approximate
    }

    chunkText(text, metadata = {}) {
        const chunks = [];
        const targetChars = this.chunkSize * this.avgCharsPerToken;
        const overlapChars = this.overlapSize * this.avgCharsPerToken;

        // Split into sentences first
        const sentences = this.splitIntoSentences(text);

        let currentChunk = '';
        let chunkIndex = 0;

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];

            if (currentChunk.length + sentence.length > targetChars && currentChunk.length > 0) {
                // Save current chunk
                chunks.push({
                    text: currentChunk.trim(),
                    topic: this.detectTopic(currentChunk),
                    difficulty: this.estimateDifficulty(currentChunk),
                    chunk_index: chunkIndex++,
                    ...metadata,
                });

                // Start new chunk with overlap
                const overlapText = this.getOverlapText(currentChunk, overlapChars);
                currentChunk = overlapText + ' ' + sentence;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }

        // Add final chunk
        if (currentChunk.trim()) {
            chunks.push({
                text: currentChunk.trim(),
                topic: this.detectTopic(currentChunk),
                difficulty: this.estimateDifficulty(currentChunk),
                chunk_index: chunkIndex,
                ...metadata,
            });
        }

        return chunks;
    }

    splitIntoSentences(text) {
        // Simple sentence splitting
        return text
            .replace(/([.!?])\s+/g, '$1|')
            .split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    getOverlapText(text, overlapChars) {
        if (text.length <= overlapChars) return text;

        // Get last N characters, but try to start at sentence boundary
        const overlapText = text.slice(-overlapChars);
        const sentenceStart = overlapText.search(/[.!?]\s+/);

        if (sentenceStart !== -1) {
            return overlapText.slice(sentenceStart + 2);
        }

        return overlapText;
    }

    detectTopic(text) {
        // Simple keyword-based topic detection
        const keywords = {
            mathematics: ['equation', 'theorem', 'proof', 'formula', 'calculate', 'derivative', 'integral'],
            science: ['experiment', 'hypothesis', 'theory', 'observation', 'molecule', 'atom', 'energy'],
            programming: ['function', 'variable', 'algorithm', 'code', 'class', 'method', 'array'],
            history: ['century', 'war', 'empire', 'revolution', 'ancient', 'medieval'],
            literature: ['author', 'novel', 'poem', 'character', 'narrative', 'metaphor'],
        };

        const lowerText = text.toLowerCase();
        let maxScore = 0;
        let detectedTopic = 'general';

        Object.entries(keywords).forEach(([topic, words]) => {
            const score = words.reduce((count, word) => {
                return count + (lowerText.includes(word) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                detectedTopic = topic;
            }
        });

        return detectedTopic;
    }

    estimateDifficulty(text) {
        // Simple difficulty estimation based on:
        // 1. Average word length
        // 2. Sentence complexity
        // 3. Technical terms

        const words = text.split(/\s+/);
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

        const sentences = this.splitIntoSentences(text);
        const avgSentenceLength = words.length / sentences.length;

        // Technical indicators
        const technicalPatterns = /\b(theorem|hypothesis|algorithm|methodology|paradigm|framework)\b/gi;
        const technicalCount = (text.match(technicalPatterns) || []).length;

        let score = 0;

        // Word length scoring
        if (avgWordLength > 6) score += 2;
        else if (avgWordLength > 5) score += 1;

        // Sentence complexity scoring
        if (avgSentenceLength > 25) score += 2;
        else if (avgSentenceLength > 15) score += 1;

        // Technical terms scoring
        if (technicalCount > 3) score += 2;
        else if (technicalCount > 0) score += 1;

        // Classify
        if (score >= 5) return 'advanced';
        if (score >= 3) return 'intermediate';
        return 'beginner';
    }
}

module.exports = new ChunkingService();
