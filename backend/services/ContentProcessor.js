const Resource = require('../models/Resource');
const PDFExtractor = require('./extractors/PDFExtractor');
const DOCExtractor = require('./extractors/DOCExtractor');
const YouTubeExtractor = require('./extractors/YouTubeExtractor');
const ChunkingService = require('./ChunkingService');
const EmbeddingService = require('./EmbeddingService');
const QdrantService = require('./QdrantService');

class ContentProcessor {
    async processResource(resourceId) {
        let resource;

        try {
            resource = await Resource.findById(resourceId);

            if (!resource) {
                throw new Error('Resource not found');
            }

            // Update status to processing
            resource.processing_status = 'processing';
            await resource.save();

            console.log(`📝 Processing resource: ${resource.title}`);

            // Step 1: Extract text
            const extracted = await this.extractText(resource);

            // Step 2: Chunk text
            const chunks = ChunkingService.chunkText(extracted.text, {
                source_type: resource.source_type,
            });

            console.log(`📦 Created ${chunks.length} chunks`);

            // Step 3: Generate embeddings
            const embeddings = await EmbeddingService.generateBatchEmbeddings(chunks);

            console.log(`🧠 Generated ${embeddings.length} embeddings`);

            // Step 4: Store in Qdrant
            const metadata = {
                project_id: resource.project_id.toString(),
                resource_id: resource._id.toString(),
                source_type: resource.source_type,
                upload_date: resource.upload_date.getTime(),
                chunk_id: `${resource._id}`,
            };

            await QdrantService.storeEmbeddings(embeddings, metadata);

            // Update resource status
            resource.processing_status = 'completed';
            resource.chunk_count = chunks.length;
            await resource.save();

            console.log(`✅ Successfully processed resource: ${resource.title}`);

            return {
                success: true,
                chunks: chunks.length,
            };
        } catch (error) {
            console.error(`❌ Error processing resource ${resourceId}:`, error);

            if (resource) {
                resource.processing_status = 'failed';
                resource.error_message = error.message;
                await resource.save();
            }

            throw error;
        }
    }

    async extractText(resource) {
        switch (resource.source_type) {
            case 'pdf':
                return await PDFExtractor.extract(resource.file_path);

            case 'doc':
                return await DOCExtractor.extract(resource.file_path);

            case 'youtube':
                return await YouTubeExtractor.extract(resource.url);

            default:
                throw new Error(`Unsupported source type: ${resource.source_type}`);
        }
    }
}

module.exports = new ContentProcessor();
