import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileSearch, Shield, TrendingUp, Sparkles, MapPin, Users, Star } from 'lucide-react';
import './Home.css';

const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = Date.now();
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
};

const Home = () => {
    return (
        <div className="home-page">

            {/* ===== HERO ===== */}
            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1" />
                    <div className="shape shape-2" />
                    <div className="shape shape-3" />
                    <div className="shape shape-4" />
                </div>

                <div className="container hero-content">
                    <div className="hero-badge animate-fade-in">
                        <Sparkles size={14} /> India's Smartest Property Platform
                    </div>
                    <h1 className="hero-title animate-fade-in-up">
                        Real Estate,<br />
                        <span className="gradient-text">Reimagined with AI</span>
                    </h1>
                    <p className="hero-desc animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                        Upload property documents. Let AI extract key details. Make smarter decisions with
                        intelligent analysis, compliance checks, and risk assessment — all in one platform.
                    </p>
                    <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/register" className="btn btn-primary btn-lg hero-btn">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/marketplace" className="btn btn-outline btn-lg">
                            Browse Properties
                        </Link>
                    </div>

                    <div className="hero-trust animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <div className="trust-avatars">
                            <div className="trust-avatar" style={{ background: '#0EA5E9' }}>RS</div>
                            <div className="trust-avatar" style={{ background: '#10B981' }}>AK</div>
                            <div className="trust-avatar" style={{ background: '#F59E0B' }}>PM</div>
                            <div className="trust-avatar" style={{ background: '#8B5CF6' }}>VK</div>
                        </div>
                        <p><strong>2,500+</strong> property professionals trust EstateIQ</p>
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid stagger-children">
                        <div className="stat-card animate-fade-in-up">
                            <div className="stat-icon"><Building2 size={22} /></div>
                            <div className="stat-value"><AnimatedCounter end={2500} suffix="+" /></div>
                            <div className="stat-label">Properties Listed</div>
                        </div>
                        <div className="stat-card animate-fade-in-up">
                            <div className="stat-icon stat-icon-green"><TrendingUp size={22} /></div>
                            <div className="stat-value"><AnimatedCounter end={98} suffix="%" /></div>
                            {/* <div>-</div> */}
                            <div className="stat-label">Accuracy Rate</div>
                            
                        </div>
                        <div className="stat-card animate-fade-in-up">
                            <div className="stat-icon stat-icon-purple"><FileSearch size={22} /></div>
                            <div className="stat-value"><AnimatedCounter end={15000} suffix="+" /></div>
                            <div className="stat-label">Documents Analyzed</div>
                        </div>
                        <div className="stat-card animate-fade-in-up">
                            <div className="stat-icon stat-icon-amber"><Star size={22} /></div>
                            <div className="stat-value">4.9</div>
                            <div className="stat-label">User Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="features-section">
                <div className="container">
                    <div className="features-header animate-fade-in">
                        <div className="section-label">Powerful Features</div>
                        <h2 className="section-title">Everything You Need to<br /><span className="gradient-text">Master Real Estate</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            From intelligent document analysis to smart property search — we've built the tools that modern real estate professionals need.
                        </p>
                    </div>

                    <div className="features-grid stagger-children">
                        <div className="feature-card hover-lift animate-fade-in-up">
                            <div className="feature-icon">
                                <Building2 size={28} />
                            </div>
                            <h3>Smart Property Management</h3>
                            <p>List, manage, and track your properties with an intuitive dashboard. Get real-time insights and performance analytics.</p>
                            <div className="feature-tag">Core</div>
                        </div>
                        <div className="feature-card hover-lift animate-fade-in-up">
                            <div className="feature-icon feature-icon-green">
                                <FileSearch size={28} />
                            </div>
                            <h3>AI Document Analysis</h3>
                            <p>Upload contracts and let our AI extract key entities — parties, financials, clauses, and critical dates — in seconds.</p>
                            <div className="feature-tag feature-tag-green">AI Powered</div>
                        </div>
                        <div className="feature-card hover-lift animate-fade-in-up">
                            <div className="feature-icon feature-icon-amber">
                                <Shield size={28} />
                            </div>
                            <h3>Risk & Compliance</h3>
                            <p>Automatically detect missing clauses, compliance issues, and contractual risks before they become costly problems.</p>
                            <div className="feature-tag feature-tag-amber">Security</div>
                        </div>
                        <div className="feature-card hover-lift animate-fade-in-up">
                            <div className="feature-icon feature-icon-purple">
                                <MapPin size={28} />
                            </div>
                            <h3>Smart Search & Filters</h3>
                            <p>Find properties instantly with intelligent filters by location, price, type, and more — across all Indian cities.</p>
                            <div className="feature-tag feature-tag-purple">Search</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="how-section">
                <div className="container">
                    <div className="features-header animate-fade-in">
                        <div className="section-label">How It Works</div>
                        <h2 className="section-title">Three Steps to Smarter<br /><span className="gradient-text">Property Decisions</span></h2>
                    </div>

                    <div className="steps-grid stagger-children">
                        <div className="step-card animate-fade-in-up">
                            <div className="step-number">01</div>
                            <h3>Upload Documents</h3>
                            <p>Upload your property contracts, agreements, or lease documents in PDF or DOC format.</p>
                        </div>
                        <div className="step-connector animate-fade-in">
                            <ArrowRight size={24} />
                        </div>
                        <div className="step-card animate-fade-in-up">
                            <div className="step-number">02</div>
                            <h3>AI Analyzes</h3>
                            <p>Our AI extracts key entities, financial terms, legal clauses, and involved parties automatically.</p>
                        </div>
                        <div className="step-connector animate-fade-in">
                            <ArrowRight size={24} />
                        </div>
                        <div className="step-card animate-fade-in-up">
                            <div className="step-number">03</div>
                            <h3>Get Insights</h3>
                            <p>Review structured data, compliance checks, and risk assessments in a clean, actionable dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card animate-fade-in">
                        <div className="cta-bg-shapes">
                            <div className="cta-shape cta-shape-1" />
                            <div className="cta-shape cta-shape-2" />
                        </div>
                        <div className="cta-content">
                            <h2>Ready to Transform Your<br />Property Decisions?</h2>
                            <p>Join thousands of Indian real estate professionals using EstateIQ for smarter, faster, and more reliable property management.</p>
                            <div className="cta-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Start Free Today <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
