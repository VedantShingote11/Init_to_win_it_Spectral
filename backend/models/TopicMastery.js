const mongoose = require('mongoose');

const topicMasterySchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    mastery_percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    last_revised: {
        type: Date,
        default: null
    },
    quiz_count: {
        type: Number,
        default: 0
    },
    correct_count: {
        type: Number,
        default: 0
    },
    difficulty_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    }
}, {
    timestamps: true
});

// Compound index for unique topic per project
topicMasterySchema.index({ project_id: 1, topic: 1 }, { unique: true });

// Method to update mastery based on quiz performance
topicMasterySchema.methods.updateFromQuizResult = function (evaluation) {
    this.quiz_count++;

    if (evaluation === 'correct') {
        this.correct_count++;
    } else if (evaluation === 'partial') {
        this.correct_count += 0.5;
    }

    this.mastery_percentage = Math.round((this.correct_count / this.quiz_count) * 100);
    this.last_revised = new Date();

    // Adjust difficulty level based on mastery
    if (this.mastery_percentage >= 80 && this.quiz_count >= 3) {
        this.difficulty_level = 'advanced';
    } else if (this.mastery_percentage >= 60 && this.quiz_count >= 2) {
        this.difficulty_level = 'intermediate';
    } else {
        this.difficulty_level = 'beginner';
    }
};

// Check if topic needs revision
topicMasterySchema.methods.needsRevision = function () {
    if (!this.last_revised) return true;

    const daysSinceRevision = Math.floor(
        (Date.now() - this.last_revised.getTime()) / (1000 * 60 * 60 * 24)
    );

    const threshold = parseInt(process.env.REVISION_THRESHOLD_DAYS) || 7;
    const masteryThreshold = parseInt(process.env.MASTERY_THRESHOLD_PERCENTAGE) || 80;

    return daysSinceRevision >= threshold && this.mastery_percentage < masteryThreshold;
};

module.exports = mongoose.model('TopicMastery', topicMasterySchema);
