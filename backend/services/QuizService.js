const Groq = require('groq-sdk');
const QuizSession = require('../models/QuizSession');
const TopicMastery = require('../models/TopicMastery');
const QuizHistory = require('../models/QuizHistory');
const EmbeddingService = require('./EmbeddingService');
const QdrantService = require('./QdrantService');
const { QUIZ_GENERATION_PROMPT, EVALUATION_PROMPT } = require('./PromptTemplates');

class QuizService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        this.maxQuestions = parseInt(process.env.MAX_QUIZ_QUESTIONS) || 10;
    }

    async startQuizSession(projectId) {
        try {
            // Create new quiz session
            const session = new QuizSession({
                project_id: projectId,
                current_difficulty: 'intermediate', // Start at medium
                questions: [],
                is_active: true,
            });

            await session.save();

            // Generate first question
            const firstQuestion = await this.generateQuestion(
                projectId,
                'intermediate',
                null // Random topic
            );

            session.questions.push(firstQuestion);
            await session.save();

            return {
                session_id: session._id,
                question: this.formatQuestionForUser(firstQuestion),
                question_number: 1,
                total_questions: this.maxQuestions,
            };
        } catch (error) {
            console.error('❌ Error starting quiz session:', error);
            throw error;
        }
    }

    async generateQuestion(projectId, difficulty, topic = null) {
        try {
            // Get relevant context
            const searchQuery = topic || 'general concepts';
            const queryEmbedding = await EmbeddingService.generateQueryEmbedding(searchQuery);

            const chunks = await QdrantService.searchSimilar(
                queryEmbedding,
                projectId,
                3
            );

            if (chunks.length === 0) {
                throw new Error('No materials available to generate questions');
            }

            const context = chunks.map(c => c.text).join('\n\n');
            const detectedTopic = topic || chunks[0].topic;

            // Determine question type based on difficulty
            const questionType = this.selectQuestionType(difficulty);

            const prompt = QUIZ_GENERATION_PROMPT
                .replace(/{difficulty}/g, difficulty)
                .replace(/{question_type}/g, questionType)
                .replace('{context}', context)
                .replace(/{topic}/g, detectedTopic);

            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a quiz generator. Generate questions based strictly on provided materials.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 500,
            });

            const responseText = response.choices[0].message.content;

            // Extract JSON from response (LLM might include extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ No JSON found in response:', responseText);
                throw new Error('Failed to generate valid question format');
            }

            const questionData = JSON.parse(jsonMatch[0]);

            return {
                question: questionData.question,
                question_type: questionType,
                options: questionData.options || [],
                correct_answer: questionData.correct_answer,
                topic: detectedTopic,
                difficulty,
                answered: false,
            };
        } catch (error) {
            console.error('❌ Error generating question:', error);
            throw error;
        }
    }

    selectQuestionType(difficulty) {
        const types = {
            beginner: ['mcq', 'short_answer'],
            intermediate: ['mcq', 'short_answer', 'conceptual'],
            advanced: ['conceptual', 'application', 'case_based'],
        };

        const availableTypes = types[difficulty] || types.intermediate;
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    async submitAnswer(sessionId, userAnswer) {
        try {
            const session = await QuizSession.findById(sessionId);

            if (!session || !session.is_active) {
                throw new Error('Invalid or inactive quiz session');
            }

            const currentIndex = session.current_question_index;
            const currentQuestion = session.questions[currentIndex];

            if (currentQuestion.answered) {
                throw new Error('Question already answered');
            }

            // Evaluate answer
            const evaluation = await this.evaluateAnswer(
                currentQuestion.question,
                currentQuestion.correct_answer,
                userAnswer
            );

            // Update question
            currentQuestion.user_answer = userAnswer;
            currentQuestion.evaluation = evaluation.evaluation;
            currentQuestion.explanation = evaluation.explanation;
            currentQuestion.answered = true;

            // Update topic mastery
            await this.updateTopicMastery(
                session.project_id,
                currentQuestion.topic,
                evaluation.evaluation
            );

            // Adjust difficulty for next question
            const nextDifficulty = this.adjustDifficulty(
                evaluation.evaluation,
                session.current_difficulty
            );

            session.current_difficulty = nextDifficulty;
            session.current_question_index++;

            // Check if quiz is complete
            if (session.current_question_index >= this.maxQuestions) {
                session.is_active = false;
                session.completed_at = new Date();
                await session.save();

                // Generate final results
                return await this.generateResults(sessionId);
            }

            // Generate next question
            const nextQuestion = await this.generateQuestion(
                session.project_id.toString(),
                nextDifficulty,
                null
            );

            session.questions.push(nextQuestion);
            await session.save();

            return {
                evaluation: evaluation.evaluation,
                explanation: evaluation.explanation,
                correct_answer: currentQuestion.correct_answer,
                next_question: this.formatQuestionForUser(nextQuestion),
                question_number: session.current_question_index + 1,
                total_questions: this.maxQuestions,
            };
        } catch (error) {
            console.error('❌ Error submitting answer:', error);
            throw error;
        }
    }

    async evaluateAnswer(question, correctAnswer, userAnswer) {
        try {
            const prompt = EVALUATION_PROMPT
                .replace('{question}', question)
                .replace('{correct_answer}', correctAnswer)
                .replace('{user_answer}', userAnswer);

            const response = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an answer evaluator. Be fair but strict.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0.3,
                max_tokens: 200,
            });

            const responseText = response.choices[0].message.content;

            // Extract JSON from response (LLM might include extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ No JSON found in evaluation response:', responseText);
                // Fallback to basic evaluation
                return {
                    evaluation: 'incorrect',
                    explanation: 'Unable to evaluate answer properly. Please try again.'
                };
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Error evaluating answer:', error);
            throw error;
        }
    }

    adjustDifficulty(evaluation, currentDifficulty) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        const currentIndex = levels.indexOf(currentDifficulty);

        if (evaluation === 'correct' && currentIndex < 2) {
            return levels[currentIndex + 1];
        } else if (evaluation === 'incorrect' && currentIndex > 0) {
            return levels[currentIndex - 1];
        }

        return currentDifficulty;
    }

    async updateTopicMastery(projectId, topic, evaluation) {
        try {
            let mastery = await TopicMastery.findOne({ project_id: projectId, topic });

            if (!mastery) {
                mastery = new TopicMastery({
                    project_id: projectId,
                    topic,
                });
            }

            mastery.updateFromQuizResult(evaluation);
            await mastery.save();
        } catch (error) {
            console.error('❌ Error updating topic mastery:', error);
        }
    }

    async generateResults(sessionId) {
        try {
            const session = await QuizSession.findById(sessionId);

            // Create quiz history record
            const quizHistory = new QuizHistory({
                project_id: session.project_id,
                session_date: session.started_at,
                questions: session.questions,
            });

            quizHistory.calculateMetrics();
            quizHistory.analyzeTopics();

            await quizHistory.save();

            // Update project mastery score
            const Project = require('../models/Project');
            const project = await Project.findById(session.project_id);
            await project.updateMasteryScore();
            await project.save();

            return {
                quiz_completed: true,
                overall_score: quizHistory.overall_score,
                accuracy: quizHistory.accuracy,
                strong_topics: quizHistory.strong_topics,
                weak_topics: quizHistory.weak_topics,
                questions_summary: session.questions.map(q => ({
                    question: q.question,
                    evaluation: q.evaluation,
                    topic: q.topic,
                })),
            };
        } catch (error) {
            console.error('❌ Error generating results:', error);
            throw error;
        }
    }

    formatQuestionForUser(question) {
        return {
            question: question.question,
            type: question.question_type,
            options: question.options,
            topic: question.topic,
            difficulty: question.difficulty,
        };
    }
}

module.exports = new QuizService();
