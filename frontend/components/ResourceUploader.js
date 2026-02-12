import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/ResourceUploader.module.css';
import { resourcesAPI } from '../utils/api';

export default function ResourceUploader({ projectId, resources, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeTitle, setYoutubeTitle] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            await resourcesAPI.uploadFile(projectId, file);
            // alert('File uploaded successfully! Processing started.'); // optional, redundant with UI update
            onUpdate();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(error.response?.data?.error || 'Failed to upload file');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleYoutubeSubmit = async (e) => {
        e.preventDefault();
        if (!youtubeUrl.trim()) return;

        try {
            setUploading(true);
            await resourcesAPI.addYouTube(projectId, youtubeUrl, youtubeTitle || 'YouTube Video');
            setYoutubeUrl('');
            setYoutubeTitle('');
            onUpdate();
        } catch (error) {
            console.error('Error adding YouTube link:', error);
            alert(error.response?.data?.error || 'Failed to add YouTube link');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { label: 'Pending', className: styles.statusPending },
            processing: { label: 'Processing', className: styles.statusProcessing },
            completed: { label: 'Ready', className: styles.statusCompleted },
            failed: { label: 'Failed', className: styles.statusFailed },
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadGrid}>
                {/* File Upload Area */}
                <motion.div
                    className={styles.uploadCard}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className={styles.uploadIcon}>📄</div>
                    <h3 className={styles.uploadTitle}>Upload Document</h3>
                    <p className={styles.uploadDesc}>PDF, DOC, DOCX (Max 50MB)</p>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className={styles.fileInput}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className={styles.uploadButton}>
                        {uploading ? 'Uploading...' : 'Brows Files'}
                    </label>
                </motion.div>

                {/* YouTube Upload Area */}
                <div className={styles.uploadCard}>
                    <div className={styles.uploadIcon}>🎥</div>
                    <h3 className={styles.uploadTitle}>Add YouTube Video</h3>
                    <p className={styles.uploadDesc}>Must have captions/transcript</p>

                    <form onSubmit={handleYoutubeSubmit} className={styles.youtubeForm}>
                        <input
                            type="text"
                            placeholder="Data Structures Lecture 1..."
                            value={youtubeTitle}
                            onChange={(e) => setYoutubeTitle(e.target.value)}
                            className={styles.input}
                            disabled={uploading}
                        />
                        <div className={styles.urlInputGroup}>
                            <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className={styles.input}
                                disabled={uploading}
                            />
                            <button type="submit" className={styles.iconButton} disabled={uploading}>
                                +
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.resourcesSection}>
                <h2 className={styles.sectionTitle}>Uploaded Resources</h2>

                {resources.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No resources uploaded yet.</p>
                    </div>
                ) : (
                    <div className={styles.resourceList}>
                        <AnimatePresence>
                            {resources.map(resource => {
                                const statusBadge = getStatusBadge(resource.processing_status);
                                return (
                                    <motion.div
                                        key={resource.id}
                                        className={styles.resourceRow}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        layout
                                    >
                                        <div className={styles.resourceIconSmall}>
                                            {resource.source_type === 'youtube' ? '🎥' : '📄'}
                                        </div>
                                        <div className={styles.resourceInfo}>
                                            <h4 className={styles.resourceTitle}>{resource.title}</h4>
                                            <div className={styles.resourceMeta}>
                                                <span className={styles.resourceType}>{resource.source_type}</span>
                                                {resource.chunk_count > 0 && (
                                                    <span className={styles.dot}>• {resource.chunk_count} chunks</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`${styles.statusBadge} ${statusBadge.className}`}>
                                            {statusBadge.label}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
