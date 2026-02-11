import { useEffect, useState } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectList from '../components/ProjectList';
import styles from '../styles/Home.module.css';
import { projectsAPI } from '../utils/api';

export default function Home() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAll();
            setProjects(response.data.projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            alert('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            await projectsAPI.create(projectData);
            setShowCreateModal(false);
            loadProjects();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>SpectraX</h1>
                    <p className={styles.subtitle}>AI-Powered Adaptive Study Assistant</p>
                </div>
                <button
                    className={styles.createButton}
                    onClick={() => setShowCreateModal(true)}
                >
                    + New Project
                </button>
            </header>

            <main className={styles.main}>
                {loading ? (
                    <div className={styles.loading}>Loading projects...</div>
                ) : (
                    <ProjectList projects={projects} onRefresh={loadProjects} />
                )}
            </main>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateProject}
                />
            )}
        </div>
    );
}
