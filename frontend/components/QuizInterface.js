import { useState } from 'react';
import styles from '../styles/QuizInterface.module.css';
import { learningAPI } from '../utils/api';

export default function QuizInterface({ projectId, activeSessionId }) {
    const [session, setSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const startQuiz = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.startQuiz(projectId);
            setSession({ id: response.data.session_id });
            setCurrentQuestion(response.data.question);
            setUserAnswer('');
            setFeedback(null);
            setResults(null);
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert(error.response?.data?.error || 'Failed to start quiz');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!userAnswer.trim()) {
            alert('Please provide an answer');
            return;
        }

        try {
            setLoading(true);
            const response = await learningAPI.submitAnswer(projectId, session.id, userAnswer);

            if (response.data.quiz_completed) {
                setResults(response.data);
                setCurrentQuestion(null);
            } else {
                setFeedback({
                    evaluation: response.data.evaluation,
                    explanation: response.data.explanation,
                    correct_answer: response.data.correct_answer,
                });

                setTimeout(() => {
                    setCurrentQuestion(response.data.next_question);
                    setUserAnswer('');
                    setFeedback(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer');
        } finally {
            setLoading(false);
        }
    };

    if (results) {
        return (
            <div className={styles.container}>
                <div className={styles.results}>
                    <h2 className={styles.resultsTitle}>Quiz Completed! 🎉</h2>

                    <div className={styles.scoreCard}>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>Overall Score</span>
                            <span className={styles.scoreValue}>{results.overall_score}%</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>Accuracy</span>
                            <span className={styles.scoreValue}>{results.accuracy}%</span>
                        </div>
                    </div>

                    {results.strong_topics.length > 0 && (
                        <div className={styles.topicsSection}>
                            <h3 className={styles.topicsTitle}>✅ Strong Topics</h3>
                            <div className={styles.topicTags}>
                                {results.strong_topics.map(topic => (
                                    <span key={topic} className={styles.topicTagStrong}>{topic}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.weak_topics.length > 0 && (
                        <div className={styles.topicsSection}>
                            <h3 className={styles.topicsTitle}>⚠️ Topics to Review</h3>
                            <div className={styles.topicTags}>
                                {results.weak_topics.map(topic => (
                                    <span key={topic} className={styles.topicTagWeak}>{topic}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className={styles.startButton} onClick={startQuiz}>
                        Take Another Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📊</div>
                    <h3>Adaptive Quiz</h3>
                    <p>Test your knowledge with AI-generated questions from your materials.</p>
                    <button className={styles.startButton} onClick={startQuiz} disabled={loading}>
                        {loading ? 'Starting...' : 'Start Quiz'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.quizCard}>
                <div className={styles.quizHeader}>
                    <span className={styles.topicBadge}>{currentQuestion.topic}</span>
                    <span className={styles.difficultyBadge}>{currentQuestion.difficulty}</span>
                </div>

                <div className={styles.question}>
                    <h3 className={styles.questionText}>{currentQuestion.question}</h3>
                </div>

                {currentQuestion.type === 'mcq' && currentQuestion.options ? (
                    <div className={styles.options}>
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                className={`${styles.option} ${userAnswer === option ? styles.optionSelected : ''}`}
                                onClick={() => setUserAnswer(option)}
                                disabled={loading || feedback}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                ) : (
                    <textarea
                        className={styles.textarea}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={5}
                        disabled={loading || feedback}
                    />
                )}

                {feedback ? (
                    <div className={`${styles.feedback} ${styles[feedback.evaluation]}`}>
                        <h4 className={styles.feedbackTitle}>
                            {feedback.evaluation === 'correct' ? '✅ Correct!' :
                                feedback.evaluation === 'partial' ? '⚠️ Partially Correct' :
                                    '❌ Incorrect'}
                        </h4>
                        <p className={styles.feedbackText}>{feedback.explanation}</p>
                        {feedback.evaluation !== 'correct' && (
                            <p className={styles.correctAnswer}>
                                <strong>Correct Answer:</strong> {feedback.correct_answer}
                            </p>
                        )}
                    </div>
                ) : (
                    <button
                        className={styles.submitButton}
                        onClick={submitAnswer}
                        disabled={loading || !userAnswer.trim()}
                    >
                        {loading ? 'Submitting...' : 'Submit Answer'}
                    </button>
                )}
            </div>
        </div>
    );
}
