const Groq = require('groq-sdk');

class EmbeddingService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    }

    async generateEmbedding(text) {
        try {
            // For now, we'll use a simple approach with Groq
            // In production, you might want to use a dedicated embedding model
            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a semantic representation of the following text.',
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                model: this.model,
                temperature: 0,
            });

            // Convert response to embedding vector (simplified approach)
            // In production, use a proper embedding model
            const embedding = this.textToVector(response.choices[0].message.content);
            return embedding;
        } catch (error) {
            console.error('❌ Error generating embedding:', error);
            throw error;
        }
    }

    async generateBatchEmbeddings(chunks) {
        try {
            const embeddings = [];

            // Process in batches to avoid rate limits
            const batchSize = 5;
            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const batchEmbeddings = await Promise.all(
                    batch.map(chunk => this.generateEmbedding(chunk.text))
                );

                embeddings.push(...batchEmbeddings.map((vector, idx) => ({
                    vector,
                    text: batch[idx].text,
                    topic: batch[idx].topic,
                    difficulty: batch[idx].difficulty,
                })));

                // Small delay to respect rate limits
                if (i + batchSize < chunks.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return embeddings;
        } catch (error) {
            console.error('❌ Error generating batch embeddings:', error);
            throw error;
        }
    }

    // Simple text-to-vector conversion (placeholder)
    // In production, replace with proper embedding model
    textToVector(text) {
        const vector = new Array(1024).fill(0);

        // Simple hash-based vector generation
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const index = (charCode * (i + 1)) % 1024;
            vector[index] += charCode / 1000;
        }

        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => val / (magnitude || 1));
    }

    async generateQueryEmbedding(query) {
        return this.generateEmbedding(query);
    }
}

module.exports = new EmbeddingService();
