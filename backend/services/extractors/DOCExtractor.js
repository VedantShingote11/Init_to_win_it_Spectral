const mammoth = require('mammoth');
const fs = require('fs').promises;

class DOCExtractor {
    async extract(filePath) {
        try {
            const buffer = await fs.readFile(filePath);

            const result = await mammoth.extractRawText({ buffer });

            // Clean text
            let text = result.value;

            // Remove excessive whitespace
            text = text.replace(/\s+/g, ' ');

            // Preserve paragraph breaks
            text = text.replace(/\.\s+/g, '.\n');

            return {
                text: text.trim(),
                metadata: {
                    warnings: result.messages,
                },
            };
        } catch (error) {
            console.error('❌ Error extracting DOC:', error);
            throw new Error(`DOC extraction failed: ${error.message}`);
        }
    }
}

module.exports = new DOCExtractor();
