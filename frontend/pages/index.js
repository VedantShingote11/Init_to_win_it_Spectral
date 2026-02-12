import Link from 'next/link';
import styles from '../styles/Landing.module.css';

export default function LandingPage() {
    return (
        <div className={styles.container}>
            {/* Header */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    SpectraX
                </div>
                <div className={styles.navLinks}>
                    <Link href="/dashboard" className={styles.signInBtn}>Sign In</Link>
                    <Link href="/dashboard" className={styles.signUpBtn}>Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.headline}>
                        Unlock the <span className={styles.highlight}>knowledge buried</span> in your study materials
                    </h1>
                    <p className={styles.subheadline}>
                        Don't just store your video transcripts—interact with them.
                        Upload your subtitle files and let our AI turn them into an instant,
                        searchable knowledge base.
                    </p>
                    <div className={styles.ctaGroup}>
                        <Link href="/dashboard" className={styles.primaryBtn}>
                            Get Started Free
                        </Link>
                        <button className={styles.secondaryBtn}>View Demo</button>
                    </div>
                </div>

                {/* Visual Mockup */}
                <div className={styles.heroImage}>
                    <div className={styles.mockupCard}>
                        {/* User Message */}
                        <div className={styles.userBubble}>
                            What were the key takeaways from the Q3 townhall regarding remote work?
                        </div>

                        {/* AI Response */}
                        <div className={styles.aiBubble}>
                            <div className={styles.accuracyBadge}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                </svg>
                                99% Accuracy
                            </div>
                            <p>According to the transcript at <strong>14:20</strong>, the CEO mentioned three main points:</p>
                            <ul className={styles.aiList}>
                                <li>Flexible hours will remain permanent.</li>
                                <li>New stipend for home office equipment.</li>
                                <li>Monthly in-person meetups starting October.</li>
                            </ul>
                        </div>

                        {/* Feature Floating Badge */}
                        <div className={styles.featureBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                            </svg>
                            Instant Indexing
                        </div>

                        <div className={styles.sourceTag}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Source: townhall_q3_2023.vtt
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>📚</div>
                    <h3 className={styles.featureTitle}>Project-Based Learning</h3>
                    <p className={styles.featureDesc}>
                        Keep your study materials organized. Each project creates an independent study environment for focused learning.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🤖</div>
                    <h3 className={styles.featureTitle}>RAG-Powered Q&A</h3>
                    <p className={styles.featureDesc}>
                        Get answers strictly from your uploaded materials. Our AI ensures accuracy and prevents hallucinations.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🧠</div>
                    <h3 className={styles.featureTitle}>Adaptive Quizzes</h3>
                    <p className={styles.featureDesc}>
                        Test your knowledge with quizzes that adjust difficulty based on your performance to help you master topics.
                    </p>
                </div>
            </section>
        </div>
    );
}
