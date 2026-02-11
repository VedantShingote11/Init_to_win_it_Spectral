const QuizHistory = require('../models/QuizHistory');
const TopicMastery = require('../models/TopicMastery');
const { PERFORMANCE_ANALYSIS_PROMPT } = require('./PromptTemplates');
const Groq = require('groq-sdk');

class PerformanceAnalyzer {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    }

    async analyzePerformance(projectId) {
        try {
            // Get recent quiz history
            const recentQuizzes = await QuizHistory.find({ project_id: projectId })
                .sort({ session_date: -1 })
                .limit(5);

            if (recentQuizzes.length === 0) {
                return {
                    message: 'No quiz history available yet. Take a quiz to see your performance analysis.',
                };
            }

            // Get topic mastery data
            const topicMastery = await TopicMastery.find({ project_id: projectId });

            // Calculate overall metrics
            const overallMetrics = this.calculateOverallMetrics(recentQuizzes);

            // Identify patterns
            const patterns = this.identifyPatterns(recentQuizzes, topicMastery);

            // Generate AI insights
            const aiInsights = await this.generateAIInsights(recentQuizzes, topicMastery);

            return {
                overall_metrics: overallMetrics,
                patterns,
                topic_breakdown: topicMastery.map(t => ({
                    topic: t.topic,
                    mastery: t.mastery_percentage,
                    difficulty_level: t.difficulty_level,
                    quiz_count: t.quiz_count,
                    needs_revision: t.needsRevision(),
                })),
                ai_insights: aiInsights,
                recent_quizzes: recentQuizzes.map(q => ({
                    date: q.session_date,
                    score: q.overall_score,
                    accuracy: q.accuracy,
                })),
            };
        } catch (error) {
            console.error('❌ Error analyzing performance:', error);
            throw error;
        }
    }

    calculateOverallMetrics(quizzes) {
        const totalQuizzes = quizzes.length;
        const avgScore = quizzes.reduce((sum, q) => sum + q.overall_score, 0) / totalQuizzes;
        const avgAccuracy = quizzes.reduce((sum, q) => sum + q.accuracy, 0) / totalQuizzes;

        // Calculate improvement trend
        const recentAvg = quizzes.slice(0, 2).reduce((sum, q) => sum + q.overall_score, 0) / Math.min(2, totalQuizzes);
        const olderAvg = quizzes.slice(-2).reduce((sum, q) => sum + q.overall_score, 0) / Math.min(2, totalQuizzes);
        const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

        return {
            total_quizzes: totalQuizzes,
            average_score: Math.round(avgScore),
            average_accuracy: Math.round(avgAccuracy),
            trend,
        };
    }

    identifyPatterns(quizzes, topicMastery) {
        // Find consistently weak topics
        const weakTopics = topicMastery
            .filter(t => t.mastery_percentage < 60)
            .map(t => t.topic);

        // Find strong topics
        const strongTopics = topicMastery
            .filter(t => t.mastery_percentage >= 80)
            .map(t => t.topic);

        // Find topics needing revision
        const needsRevision = topicMastery
            .filter(t => t.needsRevision())
            .map(t => t.topic);

        // Identify common mistake patterns
        const allQuestions = quizzes.flatMap(q => q.questions);
        const incorrectQuestions = allQuestions.filter(q => q.evaluation === 'incorrect');

        const mistakePatterns = {};
        incorrectQuestions.forEach(q => {
            if (!mistakePatterns[q.topic]) {
                mistakePatterns[q.topic] = 0;
            }
            mistakePatterns[q.topic]++;
        });

        return {
            weak_topics: weakTopics,
            strong_topics: strongTopics,
            needs_revision: needsRevision,
            common_mistakes: Object.entries(mistakePatterns)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([topic, count]) => ({ topic, count })),
        };
    }

    async generateAIInsights(quizzes, topicMastery) {
        try {
            const quizSummary = quizzes.map(q => ({
                score: q.overall_score,
                weak_topics: q.weak_topics,
                strong_topics: q.strong_topics,
            }));

            const prompt = PERFORMANCE_ANALYSIS_PROMPT.replace(
                '{quiz_results}',
                JSON.stringify(quizSummary, null, 2)
            );

            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a learning performance analyst. Provide specific, actionable insights.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 1000,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('❌ Error generating AI insights:', error);
            return 'Unable to generate AI insights at this time.';
        }
    }
}

module.exports = new PerformanceAnalyzer();
