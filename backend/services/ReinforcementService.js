const TopicMastery = require('../models/TopicMastery');
const Project = require('../models/Project');

class ReinforcementService {
    async checkReinforcementNeeds(projectId) {
        try {
            const topicMastery = await TopicMastery.find({ project_id: projectId });

            const reminders = [];

            for (const topic of topicMastery) {
                if (topic.needsRevision()) {
                    const daysSinceRevision = topic.last_revised
                        ? Math.floor((Date.now() - topic.last_revised.getTime()) / (1000 * 60 * 60 * 24))
                        : 999;

                    reminders.push({
                        topic: topic.topic,
                        mastery_percentage: topic.mastery_percentage,
                        days_since_revision: daysSinceRevision,
                        risk_level: this.calculateRiskLevel(topic.mastery_percentage, daysSinceRevision),
                        message: this.generateReminderMessage(topic),
                    });
                }
            }

            // Sort by risk level (highest first)
            reminders.sort((a, b) => {
                const riskOrder = { high: 3, medium: 2, low: 1 };
                return riskOrder[b.risk_level] - riskOrder[a.risk_level];
            });

            return reminders;
        } catch (error) {
            console.error('❌ Error checking reinforcement needs:', error);
            throw error;
        }
    }

    calculateRiskLevel(masteryPercentage, daysSinceRevision) {
        if (masteryPercentage < 50 && daysSinceRevision > 10) {
            return 'high';
        } else if (masteryPercentage < 70 && daysSinceRevision > 7) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    generateReminderMessage(topic) {
        const masteryThreshold = parseInt(process.env.MASTERY_THRESHOLD_PERCENTAGE) || 80;

        if (topic.mastery_percentage < 50) {
            return `⚠️ Critical: Your mastery of "${topic.topic}" is at ${topic.mastery_percentage}%. This topic needs immediate attention to prevent knowledge loss.`;
        } else if (topic.mastery_percentage < masteryThreshold) {
            return `📚 Reminder: "${topic.topic}" (${topic.mastery_percentage}% mastery) hasn't been revised recently. A quick review will help solidify your understanding.`;
        } else {
            return `🔄 Maintenance: Time to refresh "${topic.topic}" to maintain your ${topic.mastery_percentage}% mastery level.`;
        }
    }

    async getReminders(projectId) {
        return await this.checkReinforcementNeeds(projectId);
    }

    async markRevised(projectId, topic) {
        try {
            const topicMastery = await TopicMastery.findOne({
                project_id: projectId,
                topic,
            });

            if (topicMastery) {
                topicMastery.last_revised = new Date();
                await topicMastery.save();

                // Update project's last revision
                const project = await Project.findById(projectId);
                if (project) {
                    project.last_revision = new Date();
                    await project.save();
                }

                return { success: true, message: `Marked "${topic}" as revised` };
            }

            return { success: false, message: 'Topic not found' };
        } catch (error) {
            console.error('❌ Error marking topic as revised:', error);
            throw error;
        }
    }
}

module.exports = new ReinforcementService();
