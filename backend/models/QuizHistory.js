const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    session_date: {
        type: Date,
        default: Date.now
    },
    questions: [{
        question: String,
        question_type: {
            type: String,
            enum: ['mcq', 'short_answer', 'conceptual', 'application', 'case_based']
        },
        options: [String], // For MCQ
        user_answer: String,
        correct_answer: String,
        evaluation: {
            type: String,
            enum: ['correct', 'partial', 'incorrect']
        },
        explanation: String,
        topic: String,
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced']
        }
    }],
    overall_score: {
        type: Number,
        min: 0,
        max: 100
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100
    },
    strong_topics: [String],
    weak_topics: [String],
    conceptual_gaps: [String],
    improvement_suggestions: [String]
}, {
    timestamps: true
});

// Calculate overall score and accuracy
quizHistorySchema.methods.calculateMetrics = function () {
    if (this.questions.length === 0) {
        this.overall_score = 0;
        this.accuracy = 0;
        return;
    }

    let correctCount = 0;
    let partialCount = 0;

    this.questions.forEach(q => {
        if (q.evaluation === 'correct') correctCount++;
        else if (q.evaluation === 'partial') partialCount += 0.5;
    });

    this.accuracy = Math.round((correctCount / this.questions.length) * 100);
    this.overall_score = Math.round(((correctCount + partialCount) / this.questions.length) * 100);
};

// Identify strong and weak topics
quizHistorySchema.methods.analyzeTopics = function () {
    const topicPerformance = {};

    this.questions.forEach(q => {
        if (!topicPerformance[q.topic]) {
            topicPerformance[q.topic] = { correct: 0, total: 0 };
        }
        topicPerformance[q.topic].total++;
        if (q.evaluation === 'correct') {
            topicPerformance[q.topic].correct++;
        } else if (q.evaluation === 'partial') {
            topicPerformance[q.topic].correct += 0.5;
        }
    });

    this.strong_topics = [];
    this.weak_topics = [];

    Object.entries(topicPerformance).forEach(([topic, perf]) => {
        const percentage = (perf.correct / perf.total) * 100;
        if (percentage >= 80) {
            this.strong_topics.push(topic);
        } else if (percentage < 60) {
            this.weak_topics.push(topic);
        }
    });
};

module.exports = mongoose.model('QuizHistory', quizHistorySchema);
