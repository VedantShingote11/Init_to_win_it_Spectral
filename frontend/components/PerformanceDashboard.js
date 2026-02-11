import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from '../styles/PerformanceDashboard.module.css';
import { learningAPI } from '../utils/api';

export default function PerformanceDashboard({ projectId, topicMastery }) {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPerformance();
    }, [projectId]);

    const loadPerformance = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.getPerformance(projectId);
            setPerformance(response.data);
        } catch (error) {
            console.error('Error loading performance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading performance data...</div>;
    }

    if (!performance || performance.message) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>📈</div>
                <h3>No Performance Data Yet</h3>
                <p>{performance?.message || 'Take a quiz to see your performance analysis.'}</p>
            </div>
        );
    }

    const chartData = topicMastery.map(t => ({
        topic: t.topic,
        mastery: t.mastery_percentage,
    }));

    return (
        <div className={styles.container}>
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Quizzes</span>
                    <span className={styles.metricValue}>{performance.overall_metrics.total_quizzes}</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Average Score</span>
                    <span className={styles.metricValue}>{performance.overall_metrics.average_score}%</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Accuracy</span>
                    <span className={styles.metricValue}>{performance.overall_metrics.average_accuracy}%</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Trend</span>
                    <span className={`${styles.metricValue} ${styles[performance.overall_metrics.trend]}`}>
                        {performance.overall_metrics.trend}
                    </span>
                </div>
            </div>

            {chartData.length > 0 && (
                <div className={styles.chartSection}>
                    <h3 className={styles.sectionTitle}>Topic Mastery</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="mastery" fill="#4f46e5" name="Mastery %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {performance.ai_insights && (
                <div className={styles.insightsSection}>
                    <h3 className={styles.sectionTitle}>AI Insights</h3>
                    <div className={styles.insights}>
                        <p>{performance.ai_insights}</p>
                    </div>
                </div>
            )}

            <div className={styles.topicsGrid}>
                {performance.patterns.strong_topics.length > 0 && (
                    <div className={styles.topicsCard}>
                        <h4 className={styles.topicsTitle}>✅ Strong Topics</h4>
                        <div className={styles.topicList}>
                            {performance.patterns.strong_topics.map(topic => (
                                <span key={topic} className={styles.topicTagStrong}>{topic}</span>
                            ))}
                        </div>
                    </div>
                )}

                {performance.patterns.weak_topics.length > 0 && (
                    <div className={styles.topicsCard}>
                        <h4 className={styles.topicsTitle}>⚠️ Weak Topics</h4>
                        <div className={styles.topicList}>
                            {performance.patterns.weak_topics.map(topic => (
                                <span key={topic} className={styles.topicTagWeak}>{topic}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
