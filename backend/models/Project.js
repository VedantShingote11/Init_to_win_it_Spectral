const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    deadline: {
        type: Date,
        default: null
    },
    mastery_score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    weak_topics: [{
        type: String
    }],
    last_revision: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Virtual for checking if project needs revision
projectSchema.virtual('needs_revision').get(function () {
    if (!this.last_revision) return true;

    const daysSinceRevision = Math.floor(
        (Date.now() - this.last_revision.getTime()) / (1000 * 60 * 60 * 24)
    );

    const threshold = parseInt(process.env.REVISION_THRESHOLD_DAYS) || 7;
    const masteryThreshold = parseInt(process.env.MASTERY_THRESHOLD_PERCENTAGE) || 80;

    return daysSinceRevision >= threshold && this.mastery_score < masteryThreshold;
});

// Method to update mastery score
projectSchema.methods.updateMasteryScore = async function () {
    const TopicMastery = mongoose.model('TopicMastery');
    const topics = await TopicMastery.find({ project_id: this._id });

    if (topics.length === 0) {
        this.mastery_score = 0;
        return;
    }

    const avgMastery = topics.reduce((sum, topic) => sum + topic.mastery_percentage, 0) / topics.length;
    this.mastery_score = Math.round(avgMastery);

    // Update weak topics
    this.weak_topics = topics
        .filter(t => t.mastery_percentage < (parseInt(process.env.MASTERY_THRESHOLD_PERCENTAGE) || 80))
        .map(t => t.topic);
};

module.exports = mongoose.model('Project', projectSchema);
