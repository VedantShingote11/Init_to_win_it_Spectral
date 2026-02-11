import { useEffect, useState } from 'react';
import styles from '../styles/ReminderPanel.module.css';
import { learningAPI } from '../utils/api';

export default function ReminderPanel({ projectId }) {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReminders();
    }, [projectId]);

    const loadReminders = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.getReminders(projectId);
            setReminders(response.data.reminders);
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRevised = async (topic) => {
        try {
            await learningAPI.markRevised(projectId, topic);
            loadReminders();
        } catch (error) {
            console.error('Error marking as revised:', error);
            alert('Failed to mark as revised');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading reminders...</div>;
    }

    if (reminders.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>🎉</div>
                <h3>All Caught Up!</h3>
                <p>No topics need revision right now. Keep up the great work!</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Revision Reminders</h2>
            <p className={styles.subtitle}>
                These topics need your attention to maintain mastery
            </p>

            <div className={styles.reminderList}>
                {reminders.map((reminder, idx) => (
                    <div key={idx} className={`${styles.reminderCard} ${styles[reminder.risk_level]}`}>
                        <div className={styles.reminderHeader}>
                            <h3 className={styles.reminderTopic}>{reminder.topic}</h3>
                            <span className={styles.riskBadge}>
                                {reminder.risk_level.toUpperCase()} PRIORITY
                            </span>
                        </div>

                        <div className={styles.reminderStats}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Mastery</span>
                                <span className={styles.statValue}>{reminder.mastery_percentage}%</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Days Since Revision</span>
                                <span className={styles.statValue}>{reminder.days_since_revision}</span>
                            </div>
                        </div>

                        <p className={styles.reminderMessage}>{reminder.message}</p>

                        <div className={styles.actions}>
                            <button className={styles.reviseButton} onClick={() => markAsRevised(reminder.topic)}>
                                ✓ Mark as Revised
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
