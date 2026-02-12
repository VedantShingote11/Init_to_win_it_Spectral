import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/NotesViewer.module.css';
import { learningAPI } from '../utils/api';

export default function NotesViewer({ projectId }) {
    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('overview'); // overview, smart

    const generateOverview = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.generateOverview(projectId);
            setNotes({ type: 'overview', content: response.data.overview });
        } catch (error) {
            console.error('Error generating overview:', error);
            alert('Failed to generate overview');
        } finally {
            setLoading(false);
        }
    };

    const generateSmartNotes = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.generateSmartNotes(projectId);
            setNotes({ type: 'smart', content: response.data.smart_notes });
        } catch (error) {
            console.error('Error generating smart notes:', error);
            alert('Failed to generate smart notes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button
                    className={`${styles.toolbarButton} ${activeView === 'overview' ? styles.active : ''}`}
                    onClick={() => { setActiveView('overview'); generateOverview(); }}
                    disabled={loading}
                >
                    📚 Project Overview
                </button>
                <button
                    className={`${styles.toolbarButton} ${activeView === 'smart' ? styles.active : ''}`}
                    onClick={() => { setActiveView('smart'); generateSmartNotes(); }}
                    disabled={loading}
                >
                    🎯 Smart Notes (Personalized)
                </button>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.loading}
                    >
                        <div className={styles.spinner}></div>
                        <p>Analysing materials to generate notes...</p>
                    </motion.div>
                ) : notes ? (
                    <motion.div
                        key={notes.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={styles.notesCard}
                    >
                        <div className={styles.notesHeader}>
                            <h3>{notes.type === 'overview' ? 'Project Overview' : 'Smart Study Notes'}</h3>
                            <span className={styles.dateBadge}>Generated just now</span>
                        </div>
                        <div className={styles.notesBody}>
                            <ReactMarkdown>{notes.content}</ReactMarkdown>
                        </div>
                    </motion.div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📝</div>
                        <h3>Generate Study Notes</h3>
                        <p>Click a button above to generate structured notes from your materials.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
