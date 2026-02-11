const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

class PDFExtractor {
    async extract(filePath) {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);

            // Clean and format text
            let text = data.text;

            // Remove excessive whitespace
            text = text.replace(/\s+/g, ' ');

            // Try to preserve paragraph breaks
            text = text.replace(/\.\s+/g, '.\n');

            // Remove page numbers and headers/footers (basic approach)
            text = text.replace(/^\d+\s*$/gm, '');

            return {
                text: text.trim(),
                metadata: {
                    pages: data.numpages,
                    info: data.info,
                },
            };
        } catch (error) {
            console.error('❌ Error extracting PDF:', error);
            throw new Error(`PDF extraction failed: ${error.message}`);
        }
    }
}

module.exports = new PDFExtractor();
