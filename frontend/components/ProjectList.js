import { useRouter } from 'next/router';
import styles from '../styles/ProjectList.module.css';
import { projectsAPI } from '../utils/api';

export default function ProjectList({ projects, onRefresh }) {
    const router = useRouter();

    const handleDelete = async (id, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will delete all associated data.`)) {
            return;
        }

        try {
            await projectsAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    if (projects.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>📚</div>
                <h2>No Projects Yet</h2>
                <p>Create your first project to start learning!</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {projects.map(project => (
                <div key={project.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>{project.title}</h3>
                        <div className={styles.masteryBadge}>
                            {project.mastery_score}%
                        </div>
                    </div>

                    <p className={styles.cardDescription}>{project.description || 'No description'}</p>

                    <div className={styles.cardStats}>
                        <div className={styles.stat}>
                            <span className={styles.statIcon}>📄</span>
                            <span className={styles.statValue}>{project.resource_count}</span>
                            <span className={styles.statLabel}>Resources</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statIcon}>📊</span>
                            <span className={styles.statValue}>{project.quiz_count}</span>
                            <span className={styles.statLabel}>Quizzes</span>
                        </div>
                    </div>

                    {project.weak_topics.length > 0 && (
                        <div className={styles.weakTopics}>
                            <span className={styles.weakLabel}>Weak Topics:</span>
                            <div className={styles.topicTags}>
                                {project.weak_topics.slice(0, 3).map(topic => (
                                    <span key={topic} className={styles.topicTag}>{topic}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.needs_revision && (
                        <div className={styles.revisionAlert}>
                            ⚠️ Needs revision
                        </div>
                    )}

                    <div className={styles.cardActions}>
                        <button
                            className={styles.openButton}
                            onClick={() => router.push(`/projects/${project.id}`)}
                        >
                            Open Project
                        </button>
                        <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(project.id, project.title)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
