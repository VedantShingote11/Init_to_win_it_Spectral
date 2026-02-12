import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/ChatInterface.module.css';
import { learningAPI } from '../utils/api';

export default function ChatInterface({ projectId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await learningAPI.ask(projectId, input);

            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                sources: response.data.sources,
                confidence: response.data.confidence,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error asking question:', error);
            setMessages(prev => [...prev, {
                role: 'error',
                content: 'Failed to get answer. Please try again.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <motion.div
                        className={styles.empty}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>Ask Questions About Your Materials</h3>
                        <p>I'll answer based strictly on your uploaded study materials.</p>
                    </motion.div>
                ) : (
                    <div className={styles.messages}>
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`${styles.message} ${styles[msg.role]}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.messageContent}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className={styles.sources}>
                                            <span className={styles.sourcesLabel}>Sources:</span>
                                            {msg.sources.map((source, i) => (
                                                <span key={i} className={styles.sourceTag}>
                                                    {source.type} - {source.topic}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <motion.div
                                className={`${styles.message} ${styles.assistant}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className={styles.loadingDots}>
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your study materials..."
                    className={styles.input}
                    disabled={loading}
                />
                <button type="submit" className={styles.sendButton} disabled={loading || !input.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
}
