const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    current_question_index: {
        type: Number,
        default: 0
    },
    current_difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    questions: [{
        question: String,
        question_type: String,
        options: [String],
        correct_answer: String,
        topic: String,
        difficulty: String,
        answered: {
            type: Boolean,
            default: false
        },
        user_answer: String,
        evaluation: String,
        explanation: String
    }],
    is_active: {
        type: Boolean,
        default: true
    },
    started_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);
