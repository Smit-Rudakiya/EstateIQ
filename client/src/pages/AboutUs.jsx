import { Shield, Users, Zap, Target, Globe, Award, Sparkles } from 'lucide-react';
import './AboutContact.css';

const AboutUs = () => {
    return (
        <div className="about-page page">
            <div className="container">
                <div className="ac-header animate-fade-in">
                    <div className="section-label">About Us</div>
                    <h1 className="section-title">Intelligent Real Estate,<br /><span className="gradient-text">Made Simple</span></h1>
                    <p className="section-subtitle">EstateIQ leverages AI-powered Named Entity Recognition to transform complex property documents into structured, actionable insights — built for India's real estate professionals.</p>
                </div>

                <div className="about-mission card animate-fade-in-up">
                    <div className="about-mission-badge"><Sparkles size={16} /> Our Mission</div>
                    <h2>Revolutionizing How India <span className="gradient-text">Interacts with Property</span></h2>
                    <p>We're on a mission to simplify how people deal with real estate documents. By combining powerful AI with intuitive design, we help buyers, sellers, and agents extract critical information from contracts in seconds — not hours. From RERA compliance to stamp duty verification, EstateIQ makes property decisions smarter.</p>
                </div>

                <div className="about-values-grid stagger-children">
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon"><Shield size={24} /></div>
                        <h3>Trust & Transparency</h3>
                        <p>Every analysis is backed by clear data extraction with full visibility into how conclusions are reached.</p>
                    </div>
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon about-value-icon-green"><Zap size={24} /></div>
                        <h3>Speed & Efficiency</h3>
                        <p>What used to take legal teams hours now takes seconds with our AI-powered document processing engine.</p>
                    </div>
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon about-value-icon-amber"><Target size={24} /></div>
                        <h3>Accuracy First</h3>
                        <p>Our NER models are trained specifically for Indian real estate, achieving industry-leading extraction accuracy.</p>
                    </div>
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon about-value-icon-purple"><Users size={24} /></div>
                        <h3>User-Centered</h3>
                        <p>Designed for everyone — from first-time home buyers to seasoned real estate developers and agents.</p>
                    </div>
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon about-value-icon-green"><Globe size={24} /></div>
                        <h3>Pan-India Coverage</h3>
                        <p>Supporting all Indian states with region-specific document formats, stamp duties, and regulatory requirements.</p>
                    </div>
                    <div className="about-value-card card hover-lift animate-fade-in-up">
                        <div className="about-value-icon about-value-icon-amber"><Award size={24} /></div>
                        <h3>Compliance Ready</h3>
                        <p>Built-in RERA and regulatory verification ensures your documents meet legal standards automatically.</p>
                    </div>
                </div>

                <div className="about-stats animate-fade-in-up">
                    <div className="about-stat"><span className="gradient-text">2,500+</span><p>Properties Listed</p></div>
                    <div className="about-stat"><span className="gradient-text">15K+</span><p>Documents Processed</p></div>
                    <div className="about-stat"><span className="gradient-text">98%</span><p>Accuracy Rate</p></div>
                    <div className="about-stat"><span className="gradient-text">4.9★</span><p>User Rating</p></div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
