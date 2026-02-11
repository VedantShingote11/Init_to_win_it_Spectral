const Groq = require('groq-sdk');
const EmbeddingService = require('./EmbeddingService');
const QdrantService = require('./QdrantService');
const { RAG_ANSWER_PROMPT } = require('./PromptTemplates');

class RAGService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    }

    async answerQuestion(query, projectId) {
        try {
            // Step 1: Generate query embedding
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding(query);

            // Step 2: Retrieve relevant chunks (filtered by project)
            const retrievedChunks = await QdrantService.searchSimilar(
                queryEmbedding,
                projectId,
                5 // top-k
            );

            if (retrievedChunks.length === 0) {
                return {
                    answer: 'This topic is not covered in your uploaded materials.',
                    sources: [],
                    confidence: 0,
                };
            }

            // Step 3: Combine chunks into context
            const context = retrievedChunks
                .map((chunk, idx) => `[Source ${idx + 1} - ${chunk.source_type}]: ${chunk.text}`)
                .join('\n\n');

            // Step 4: Generate answer using strict RAG prompt
            const prompt = RAG_ANSWER_PROMPT
                .replace('{context}', context)
                .replace('{question}', query);

            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a strict learning assistant that only uses provided context.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0.3,
                max_tokens: 1000,
            });

            const answer = response.choices[0].message.content;

            // Step 5: Extract sources
            const sources = retrievedChunks.map((chunk, idx) => ({
                index: idx + 1,
                type: chunk.source_type,
                topic: chunk.topic,
                relevance: chunk.score,
            }));

            return {
                answer,
                sources,
                confidence: retrievedChunks[0].score,
            };
        } catch (error) {
            console.error('❌ Error in RAG answering:', error);
            throw error;
        }
    }

    async generateWithContext(prompt, projectId, topK = 10) {
        try {
            // Get relevant context
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding(prompt);
            const retrievedChunks = await QdrantService.searchSimilar(
                queryEmbedding,
                projectId,
                topK
            );

            const context = retrievedChunks.map(chunk => chunk.text).join('\n\n');

            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt.replace('{context}', context),
                    },
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 2000,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('❌ Error generating with context:', error);
            throw error;
        }
    }
}

module.exports = new RAGService();
