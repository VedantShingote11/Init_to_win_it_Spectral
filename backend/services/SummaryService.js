const RAGService = require('./RAGService');
const { SUMMARY_PROMPT } = require('./PromptTemplates');
const QdrantService = require('./QdrantService');
const EmbeddingService = require('./EmbeddingService');

class SummaryService {
    async generateProjectOverview(projectId) {
        try {
            // Get all chunks for the project (sample approach)
            const overviewQuery = 'overview main topics key concepts';
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding(overviewQuery);

            const chunks = await QdrantService.searchSimilar(queryEmbedding, projectId, 20);

            if (chunks.length === 0) {
                return 'No materials uploaded yet for this project.';
            }

            const context = chunks.map(c => c.text).join('\n\n');

            const prompt = `Create a high-level overview of all study materials for this project.

Materials:
${context}

Provide:
1. Main topics covered
2. Scope of content
3. Key areas of focus
4. Suggested study approach`;

            return await RAGService.generateWithContext(prompt, projectId, 20);
        } catch (error) {
            console.error('❌ Error generating project overview:', error);
            throw error;
        }
    }

    async generateTopicNotes(projectId, topic) {
        try {
            const prompt = SUMMARY_PROMPT.replace('{topic}', topic);
            return await RAGService.generateWithContext(prompt, projectId, 15);
        } catch (error) {
            console.error('❌ Error generating topic notes:', error);
            throw error;
        }
    }

    async generateAllTopicsNotes(projectId) {
        try {
            // Get all unique topics from the project
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding('all topics');
            const chunks = await QdrantService.searchSimilar(queryEmbedding, projectId, 30);

            const topics = [...new Set(chunks.map(c => c.topic))];

            const notes = {};
            for (const topic of topics) {
                notes[topic] = await this.generateTopicNotes(projectId, topic);
            }

            return notes;
        } catch (error) {
            console.error('❌ Error generating all topics notes:', error);
            throw error;
        }
    }
}

module.exports = new SummaryService();
