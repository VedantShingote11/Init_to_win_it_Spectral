const TopicMastery = require('../models/TopicMastery');
const QuizHistory = require('../models/QuizHistory');
const Resource = require('../models/Resource');
const RAGService = require('./RAGService');
const { SMART_NOTES_PROMPT } = require('./PromptTemplates');

class SmartNotesService {
    async generateSmartNotes(projectId) {
        try {
            // Get performance data
            const topicMastery = await TopicMastery.find({ project_id: projectId });
            const recentQuizzes = await QuizHistory.find({ project_id: projectId })
                .sort({ session_date: -1 })
                .limit(3);

            if (topicMastery.length === 0) {
                return 'Take a quiz first to generate personalized smart notes based on your performance.';
            }

            // Identify weak topics
            const weakTopics = topicMastery
                .filter(t => t.mastery_percentage < 80)
                .sort((a, b) => a.mastery_percentage - b.mastery_percentage)
                .map(t => t.topic);

            // Identify strong topics
            const strongTopics = topicMastery
                .filter(t => t.mastery_percentage >= 80)
                .map(t => t.topic);

            // Collect recent mistakes
            const recentMistakes = recentQuizzes
                .flatMap(q => q.questions)
                .filter(q => q.evaluation === 'incorrect')
                .slice(0, 5)
                .map(q => ({ topic: q.topic, question: q.question }));

            // Check for YouTube resources (for timestamps)
            const youtubeResources = await Resource.find({
                project_id: projectId,
                source_type: 'youtube',
            });

            let youtubeTimestamps = '';
            if (youtubeResources.length > 0) {
                youtubeTimestamps = '\n\n## Recommended Video Segments\n[Include relevant timestamps for weak topics]';
            }

            // Build prompt
            const prompt = SMART_NOTES_PROMPT
                .replace('{weak_topics}', weakTopics.join(', ') || 'None identified yet')
                .replace('{strong_topics}', strongTopics.join(', ') || 'None identified yet')
                .replace('{recent_mistakes}', JSON.stringify(recentMistakes, null, 2))
                .replace('{youtube_timestamps}', youtubeTimestamps);

            // Generate personalized notes
            const smartNotes = await RAGService.generateWithContext(prompt, projectId, 20);

            return smartNotes;
        } catch (error) {
            console.error('❌ Error generating smart notes:', error);
            throw error;
        }
    }

    async generateAdvancedMaterial(projectId) {
        try {
            // For students with strong performance, generate advanced material
            const topicMastery = await TopicMastery.find({ project_id: projectId });

            const strongTopics = topicMastery
                .filter(t => t.mastery_percentage >= 85)
                .map(t => t.topic);

            if (strongTopics.length === 0) {
                return null;
            }

            const prompt = `Generate advanced-level practice material for these mastered topics: ${strongTopics.join(', ')}

Create:
1. Advanced conceptual questions
2. Real-world application scenarios
3. Integration challenges (combining multiple topics)
4. Critical thinking exercises

Use the study materials as a foundation.`;

            return await RAGService.generateWithContext(prompt, projectId, 15);
        } catch (error) {
            console.error('❌ Error generating advanced material:', error);
            return null;
        }
    }
}

module.exports = new SmartNotesService();
