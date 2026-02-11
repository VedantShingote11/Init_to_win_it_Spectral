import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatInterface from '../../components/ChatInterface';
import NotesViewer from '../../components/NotesViewer';
import PerformanceDashboard from '../../components/PerformanceDashboard';
import QuizInterface from '../../components/QuizInterface';
import ReminderPanel from '../../components/ReminderPanel';
import ResourceUploader from '../../components/ResourceUploader';
import styles from '../../styles/Project.module.css';
import { projectsAPI } from '../../utils/api';

export default function ProjectPage() {
    const router = useRouter();
    const { id } = router.query;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
        if (id) {
            loadProject();
        }
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(id);
            setProject(response.data);
        } catch (error) {
            console.error('Error loading project:', error);
            alert('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading project...</div>;
    }

    if (!project) {
        return <div className={styles.error}>Project not found</div>;
    }

    const tabs = [
        { id: 'upload', label: 'Upload Resources', icon: '📤' },
        { id: 'chat', label: 'Ask Questions', icon: '💬' },
        { id: 'notes', label: 'Notes & Summaries', icon: '📝' },
        { id: 'quiz', label: 'Take Quiz', icon: '📊' },
        { id: 'performance', label: 'Performance', icon: '📈' },
        { id: 'reminders', label: 'Reminders', icon: '🔔' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backButton} onClick={() => router.push('/')}>
                        ← Back
                    </button>
                    <div className={styles.projectInfo}>
                        <h1 className={styles.title}>{project.project.title}</h1>
                        <p className={styles.description}>{project.project.description}</p>
                    </div>
                    <div className={styles.masteryBadge}>
                        <span className={styles.masteryLabel}>Mastery</span>
                        <span className={styles.masteryScore}>{project.project.mastery_score}%</span>
                    </div>
                </div>

                <nav className={styles.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            <span className={styles.tabLabel}>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main className={styles.main}>
                {activeTab === 'upload' && (
                    <ResourceUploader projectId={id} resources={project.resources} onUpdate={loadProject} />
                )}
                {activeTab === 'chat' && (
                    <ChatInterface projectId={id} />
                )}
                {activeTab === 'notes' && (
                    <NotesViewer projectId={id} />
                )}
                {activeTab === 'quiz' && (
                    <QuizInterface projectId={id} activeSessionId={project.active_quiz_session} />
                )}
                {activeTab === 'performance' && (
                    <PerformanceDashboard projectId={id} topicMastery={project.topic_mastery} />
                )}
                {activeTab === 'reminders' && (
                    <ReminderPanel projectId={id} />
                )}
            </main>
        </div>
    );
}
