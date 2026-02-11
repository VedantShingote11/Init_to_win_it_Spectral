const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    source_type: {
        type: String,
        enum: ['pdf', 'doc', 'youtube'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        default: null
    },
    file_path: {
        type: String,
        default: null
    },
    processing_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    error_message: {
        type: String,
        default: null
    },
    chunk_count: {
        type: Number,
        default: 0
    },
    upload_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
resourceSchema.index({ project_id: 1, processing_status: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
