import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
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
            <motion.div
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className={styles.emptyIcon}>📈</div>
                <h3>No Performance Data Yet</h3>
                <p>{performance?.message || 'Take a quiz to see your performance analysis.'}</p>
            </motion.div>
        );
    }

    const chartData = topicMastery.map(t => ({
        topic: t.topic,
        mastery: t.mastery_percentage,
    }));

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <div className={styles.metricsGrid}>
                {['Total Quizzes', 'Average Score', 'Accuracy', 'Trend'].map((label, idx) => {
                    const value = idx === 0 ? performance.overall_metrics.total_quizzes :
                        idx === 1 ? `${performance.overall_metrics.average_score}%` :
                            idx === 2 ? `${performance.overall_metrics.average_accuracy}%` :
                                performance.overall_metrics.trend;
                    return (
                        <motion.div key={label} className={styles.metricCard} variants={itemVariants}>
                            <span className={styles.metricLabel}>{label}</span>
                            <span className={`${styles.metricValue} ${label === 'Trend' ? styles[value] : ''}`}>
                                {value}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {chartData.length > 0 && (
                <motion.div className={styles.chartSection} variants={itemVariants}>
                    <h3 className={styles.sectionTitle}>Topic Mastery</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="topic" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="mastery" fill="#2563eb" radius={[4, 4, 0, 0]} name="Mastery %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {performance.ai_insights && (
                <motion.div className={styles.insightsSection} variants={itemVariants}>
                    <h3 className={styles.sectionTitle}>AI Insights</h3>
                    <div className={styles.insights}>
                        <div className={styles.insightIcon}>💡</div>
                        <p>{performance.ai_insights}</p>
                    </div>
                </motion.div>
            )}

            <div className={styles.topicsGrid}>
                {performance.patterns.strong_topics.length > 0 && (
                    <motion.div className={styles.topicsCard} variants={itemVariants}>
                        <h4 className={styles.topicsTitle}>✅ Strong Topics</h4>
                        <div className={styles.topicList}>
                            {performance.patterns.strong_topics.map(topic => (
                                <span key={topic} className={styles.topicTagStrong}>{topic}</span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {performance.patterns.weak_topics.length > 0 && (
                    <motion.div className={styles.topicsCard} variants={itemVariants}>
                        <h4 className={styles.topicsTitle}>⚠️ Weak Topics</h4>
                        <div className={styles.topicList}>
                            {performance.patterns.weak_topics.map(topic => (
                                <span key={topic} className={styles.topicTagWeak}>{topic}</span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
