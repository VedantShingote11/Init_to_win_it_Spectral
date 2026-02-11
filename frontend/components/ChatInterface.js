import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/ChatInterface.module.css';
import { learningAPI } from '../utils/api';

export default function ChatInterface({ projectId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

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
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>Ask Questions About Your Materials</h3>
                        <p>I'll answer based strictly on your uploaded study materials.</p>
                    </div>
                ) : (
                    <div className={styles.messages}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                                <div className={styles.messageContent}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className={styles.sources}>
                                        <span className={styles.sourcesLabel}>Sources:</span>
                                        {msg.sources.map(source => (
                                            <span key={source.index} className={styles.sourceTag}>
                                                {source.type} - {source.topic}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.loading}>Thinking...</div>
                            </div>
                        )}
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
                    Send
                </button>
            </form>
        </div>
    );
}
