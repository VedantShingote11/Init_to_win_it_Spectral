import { useState } from 'react';
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
            alert('File uploaded successfully! Processing started.');
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
            alert('YouTube link added successfully! Processing started.');
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
            processing: { label: 'Processing...', className: styles.statusProcessing },
            completed: { label: 'Completed', className: styles.statusCompleted },
            failed: { label: 'Failed', className: styles.statusFailed },
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadSection}>
                <h2 className={styles.sectionTitle}>Upload Learning Resources</h2>

                <div className={styles.uploadBox}>
                    <h3 className={styles.uploadTitle}>📄 Upload PDF or DOC</h3>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className={styles.fileInput}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className={styles.fileLabel}>
                        {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className={styles.uploadHint}>Supported: PDF, DOC, DOCX (Max 50MB)</p>
                </div>

                <div className={styles.uploadBox}>
                    <h3 className={styles.uploadTitle}>🎥 Add YouTube Video</h3>
                    <form onSubmit={handleYoutubeSubmit} className={styles.youtubeForm}>
                        <input
                            type="text"
                            placeholder="YouTube URL"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className={styles.input}
                            disabled={uploading}
                        />
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={youtubeTitle}
                            onChange={(e) => setYoutubeTitle(e.target.value)}
                            className={styles.input}
                            disabled={uploading}
                        />
                        <button type="submit" className={styles.submitButton} disabled={uploading}>
                            {uploading ? 'Adding...' : 'Add Video'}
                        </button>
                    </form>
                    <p className={styles.uploadHint}>Video must have transcripts available</p>
                </div>
            </div>

            <div className={styles.resourcesSection}>
                <h2 className={styles.sectionTitle}>Uploaded Resources</h2>

                {resources.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No resources uploaded yet. Upload materials to start learning!</p>
                    </div>
                ) : (
                    <div className={styles.resourceList}>
                        {resources.map(resource => {
                            const statusBadge = getStatusBadge(resource.processing_status);
                            return (
                                <div key={resource.id} className={styles.resourceCard}>
                                    <div className={styles.resourceIcon}>
                                        {resource.source_type === 'youtube' ? '🎥' : '📄'}
                                    </div>
                                    <div className={styles.resourceInfo}>
                                        <h4 className={styles.resourceTitle}>{resource.title}</h4>
                                        <div className={styles.resourceMeta}>
                                            <span className={styles.resourceType}>{resource.source_type.toUpperCase()}</span>
                                            {resource.chunk_count > 0 && (
                                                <span className={styles.resourceChunks}>{resource.chunk_count} chunks</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${styles.statusBadge} ${statusBadge.className}`}>
                                        {statusBadge.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
