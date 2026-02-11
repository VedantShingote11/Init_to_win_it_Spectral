const express = require('express');
const router = express.Router();
const RAGService = require('../services/RAGService');
const SummaryService = require('../services/SummaryService');
const QuizService = require('../services/QuizService');
const PerformanceAnalyzer = require('../services/PerformanceAnalyzer');
const SmartNotesService = require('../services/SmartNotesService');
const ReinforcementService = require('../services/ReinforcementService');

// RAG-based Q&A
router.post('/:projectId/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const result = await RAGService.answerQuestion(question, req.params.projectId);

        res.json(result);
    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ error: 'Failed to answer question' });
    }
});

// Generate project overview summary
router.post('/:projectId/summaries/overview', async (req, res) => {
    try {
        const overview = await SummaryService.generateProjectOverview(req.params.projectId);

        res.json({ overview });
    } catch (error) {
        console.error('Error generating overview:', error);
        res.status(500).json({ error: 'Failed to generate overview' });
    }
});

// Generate topic-specific notes
router.post('/:projectId/summaries/topic', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const notes = await SummaryService.generateTopicNotes(req.params.projectId, topic);

        res.json({ topic, notes });
    } catch (error) {
        console.error('Error generating topic notes:', error);
        res.status(500).json({ error: 'Failed to generate topic notes' });
    }
});

// Generate all topics notes
router.post('/:projectId/summaries/all', async (req, res) => {
    try {
        const notes = await SummaryService.generateAllTopicsNotes(req.params.projectId);

        res.json({ notes });
    } catch (error) {
        console.error('Error generating all notes:', error);
        res.status(500).json({ error: 'Failed to generate notes' });
    }
});

// Start quiz session
router.post('/:projectId/quiz/start', async (req, res) => {
    try {
        const result = await QuizService.startQuizSession(req.params.projectId);

        res.json(result);
    } catch (error) {
        console.error('Error starting quiz:', error);
        res.status(500).json({ error: 'Failed to start quiz' });
    }
});

// Submit quiz answer
router.post('/:projectId/quiz/answer', async (req, res) => {
    try {
        const { session_id, answer } = req.body;

        if (!session_id || !answer) {
            return res.status(400).json({ error: 'Session ID and answer are required' });
        }

        const result = await QuizService.submitAnswer(session_id, answer);

        res.json(result);
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// Get performance analysis
router.get('/:projectId/performance', async (req, res) => {
    try {
        const analysis = await PerformanceAnalyzer.analyzePerformance(req.params.projectId);

        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing performance:', error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
});

// Generate smart notes
router.post('/:projectId/smart-notes', async (req, res) => {
    try {
        const smartNotes = await SmartNotesService.generateSmartNotes(req.params.projectId);

        res.json({ smart_notes: smartNotes });
    } catch (error) {
        console.error('Error generating smart notes:', error);
        res.status(500).json({ error: 'Failed to generate smart notes' });
    }
});

// Generate advanced material
router.post('/:projectId/advanced-material', async (req, res) => {
    try {
        const material = await SmartNotesService.generateAdvancedMaterial(req.params.projectId);

        if (!material) {
            return res.json({ message: 'No advanced material available yet. Master more topics first.' });
        }

        res.json({ advanced_material: material });
    } catch (error) {
        console.error('Error generating advanced material:', error);
        res.status(500).json({ error: 'Failed to generate advanced material' });
    }
});

// Get revision reminders
router.get('/:projectId/reminders', async (req, res) => {
    try {
        const reminders = await ReinforcementService.getReminders(req.params.projectId);

        res.json({ reminders });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// Mark topic as revised
router.post('/:projectId/reminders/mark-revised', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const result = await ReinforcementService.markRevised(req.params.projectId, topic);

        res.json(result);
    } catch (error) {
        console.error('Error marking topic as revised:', error);
        res.status(500).json({ error: 'Failed to mark topic as revised' });
    }
});

module.exports = router;
