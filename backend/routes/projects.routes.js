const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const QdrantService = require('../services/QdrantService');
const TopicMastery = require('../models/TopicMastery');
const QuizHistory = require('../models/QuizHistory');
const QuizSession = require('../models/QuizSession');

// Create new project
router.post('/', async (req, res) => {
    try {
        const { title, description, deadline } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const project = new Project({
            title,
            description: description || '',
            deadline: deadline || null,
            mastery_score: 0,
            weak_topics: [],
            last_revision: null,
        });

        await project.save();

        res.status(201).json({
            message: 'Project created successfully',
            project: {
                id: project._id,
                title: project.title,
                description: project.description,
                deadline: project.deadline,
                created_at: project.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ updatedAt: -1 });

        const projectsWithStats = await Promise.all(
            projects.map(async (project) => {
                const resourceCount = await Resource.countDocuments({ project_id: project._id });
                const quizCount = await QuizHistory.countDocuments({ project_id: project._id });

                return {
                    id: project._id,
                    title: project.title,
                    description: project.description,
                    deadline: project.deadline,
                    mastery_score: project.mastery_score,
                    weak_topics: project.weak_topics,
                    last_revision: project.last_revision,
                    resource_count: resourceCount,
                    quiz_count: quizCount,
                    needs_revision: project.needs_revision,
                    created_at: project.createdAt,
                    updated_at: project.updatedAt,
                };
            })
        );

        res.json({ projects: projectsWithStats });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get single project with learning state
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Get resources
        const resources = await Resource.find({ project_id: project._id });

        // Get topic mastery
        const topicMastery = await TopicMastery.find({ project_id: project._id });

        // Get quiz history
        const quizHistory = await QuizHistory.find({ project_id: project._id })
            .sort({ session_date: -1 })
            .limit(10);

        // Check for active quiz session
        const activeSession = await QuizSession.findOne({
            project_id: project._id,
            is_active: true,
        });

        res.json({
            project: {
                id: project._id,
                title: project.title,
                description: project.description,
                deadline: project.deadline,
                mastery_score: project.mastery_score,
                weak_topics: project.weak_topics,
                last_revision: project.last_revision,
                needs_revision: project.needs_revision,
                created_at: project.createdAt,
                updated_at: project.updatedAt,
            },
            resources: resources.map(r => ({
                id: r._id,
                title: r.title,
                source_type: r.source_type,
                processing_status: r.processing_status,
                chunk_count: r.chunk_count,
                upload_date: r.upload_date,
            })),
            topic_mastery: topicMastery.map(t => ({
                topic: t.topic,
                mastery_percentage: t.mastery_percentage,
                difficulty_level: t.difficulty_level,
                quiz_count: t.quiz_count,
                last_revised: t.last_revised,
                needs_revision: t.needsRevision(),
            })),
            quiz_history: quizHistory.map(q => ({
                id: q._id,
                date: q.session_date,
                score: q.overall_score,
                accuracy: q.accuracy,
                strong_topics: q.strong_topics,
                weak_topics: q.weak_topics,
            })),
            active_quiz_session: activeSession ? activeSession._id : null,
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { title, description, deadline } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (deadline !== undefined) project.deadline = deadline;

        await project.save();

        res.json({
            message: 'Project updated successfully',
            project: {
                id: project._id,
                title: project.title,
                description: project.description,
                deadline: project.deadline,
            },
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete all associated data
        await Resource.deleteMany({ project_id: project._id });
        await TopicMastery.deleteMany({ project_id: project._id });
        await QuizHistory.deleteMany({ project_id: project._id });
        await QuizSession.deleteMany({ project_id: project._id });

        // Delete from Qdrant
        await QdrantService.deleteByProject(project._id.toString());

        // Delete project
        await project.deleteOne();

        res.json({ message: 'Project and all associated data deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
