const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Resource = require('../models/Resource');
const ContentProcessor = require('../services/ContentProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC/DOCX files are allowed'));
        }
    },
});

// Upload PDF/DOC file
router.post('/upload/:projectId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { projectId } = req.params;
        const ext = path.extname(req.file.originalname).toLowerCase();
        const sourceType = ext === '.pdf' ? 'pdf' : 'doc';

        const resource = new Resource({
            project_id: projectId,
            source_type: sourceType,
            title: req.file.originalname,
            file_path: req.file.path,
            processing_status: 'pending',
        });

        await resource.save();

        // Process asynchronously
        ContentProcessor.processResource(resource._id.toString())
            .catch(err => console.error('Background processing error:', err));

        res.status(201).json({
            message: 'File uploaded successfully. Processing started.',
            resource: {
                id: resource._id,
                title: resource.title,
                source_type: resource.source_type,
                processing_status: resource.processing_status,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Add YouTube link
router.post('/youtube/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { url, title } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        // Validate YouTube URL
        const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        if (!youtubePattern.test(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const resource = new Resource({
            project_id: projectId,
            source_type: 'youtube',
            title: title || 'YouTube Video',
            url,
            processing_status: 'pending',
        });

        await resource.save();

        // Process asynchronously
        ContentProcessor.processResource(resource._id.toString())
            .catch(err => console.error('Background processing error:', err));

        res.status(201).json({
            message: 'YouTube link added successfully. Processing started.',
            resource: {
                id: resource._id,
                title: resource.title,
                url: resource.url,
                processing_status: resource.processing_status,
            },
        });
    } catch (error) {
        console.error('Error adding YouTube link:', error);
        res.status(500).json({ error: 'Failed to add YouTube link' });
    }
});

// Get resources for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const resources = await Resource.find({ project_id: req.params.projectId })
            .sort({ upload_date: -1 });

        res.json({
            resources: resources.map(r => ({
                id: r._id,
                title: r.title,
                source_type: r.source_type,
                url: r.url,
                processing_status: r.processing_status,
                error_message: r.error_message,
                chunk_count: r.chunk_count,
                upload_date: r.upload_date,
            })),
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get resource processing status
router.get('/:id/status', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json({
            id: resource._id,
            title: resource.title,
            processing_status: resource.processing_status,
            error_message: resource.error_message,
            chunk_count: resource.chunk_count,
        });
    } catch (error) {
        console.error('Error fetching resource status:', error);
        res.status(500).json({ error: 'Failed to fetch resource status' });
    }
});

// Delete resource
router.delete('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Delete from Qdrant
        await QdrantService.deleteByResource(resource._id.toString());

        // Delete file if exists
        if (resource.file_path) {
            const fs = require('fs').promises;
            try {
                await fs.unlink(resource.file_path);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        await resource.deleteOne();

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

module.exports = router;
