const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantService {
    constructor() {
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
        });
        this.collectionName = 'learning_materials';
        this.vectorSize = 1024; // Groq embedding dimension
    }

    async initializeCollection() {
        try {
            // Check if collection exists
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(
                col => col.name === this.collectionName
            );

            if (!exists) {
                // Create collection with proper schema
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine',
                    },
                });

                // Create payload indexes for efficient filtering
                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: 'project_id',
                    field_schema: 'keyword',
                });

                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: 'source_type',
                    field_schema: 'keyword',
                });

                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: 'topic',
                    field_schema: 'keyword',
                });

                console.log(`✅ Created Qdrant collection: ${this.collectionName}`);
            } else {
                console.log(`✅ Qdrant collection already exists: ${this.collectionName}`);
            }
        } catch (error) {
            console.error('❌ Error initializing Qdrant collection:', error);
            throw error;
        }
    }

    async storeEmbeddings(embeddings, metadata) {
        try {
            const points = embeddings.map((embedding, index) => ({
                id: this.generateUUID(), // Use UUID instead of string concatenation
                vector: embedding.vector,
                payload: {
                    project_id: metadata.project_id,
                    resource_id: metadata.resource_id,
                    source_type: metadata.source_type,
                    topic: embedding.topic || 'general',
                    difficulty_estimate: embedding.difficulty || 'intermediate',
                    chunk_id: `${metadata.chunk_id}_${index}`,
                    upload_date: metadata.upload_date,
                    text: embedding.text,
                },
            }));

            await this.client.upsert(this.collectionName, {
                wait: true,
                points,
            });

            console.log(`✅ Stored ${points.length} embeddings in Qdrant`);
            return points.length;
        } catch (error) {
            console.error('❌ Error storing embeddings:', error);
            throw error;
        }
    }

    // Generate UUID v4 for Qdrant point IDs
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async searchSimilar(queryVector, projectId, topK = 5) {
        try {
            const searchResult = await this.client.search(this.collectionName, {
                vector: queryVector,
                filter: {
                    must: [
                        {
                            key: 'project_id',
                            match: { value: projectId },
                        },
                    ],
                },
                limit: topK,
                with_payload: true,
            });

            return searchResult.map(result => ({
                text: result.payload.text,
                topic: result.payload.topic,
                source_type: result.payload.source_type,
                difficulty: result.payload.difficulty_estimate,
                score: result.score,
            }));
        } catch (error) {
            console.error('❌ Error searching Qdrant:', error);
            throw error;
        }
    }

    async deleteByProject(projectId) {
        try {
            await this.client.delete(this.collectionName, {
                filter: {
                    must: [
                        {
                            key: 'project_id',
                            match: { value: projectId },
                        },
                    ],
                },
            });

            console.log(`✅ Deleted all embeddings for project: ${projectId}`);
        } catch (error) {
            console.error('❌ Error deleting embeddings:', error);
            throw error;
        }
    }

    async deleteByResource(resourceId) {
        try {
            await this.client.delete(this.collectionName, {
                filter: {
                    must: [
                        {
                            key: 'resource_id',
                            match: { value: resourceId },
                        },
                    ],
                },
            });

            console.log(`✅ Deleted all embeddings for resource: ${resourceId}`);
        } catch (error) {
            console.error('❌ Error deleting embeddings:', error);
            throw error;
        }
    }
}

module.exports = new QdrantService();
