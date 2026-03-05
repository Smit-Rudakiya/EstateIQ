import { Shield, Users, Zap, Target, Globe, Award } from 'lucide-react';
import './AboutContact.css';

const AboutUs = () => {
    return (
        <div className="about-page page">
            <div className="container">
                <div className="ac-header animate-fade-in">
                    <div className="section-label">About Us</div>
                    <h1 className="section-title">Intelligent Real Estate, Made Simple</h1>
                    <p className="section-subtitle">EstateIQ leverages AI-powered Named Entity Recognition to transform complex property documents into structured, actionable insights.</p>
                </div>

                <div className="about-mission card animate-fade-in">
                    <h2>Our Mission</h2>
                    <p>We're on a mission to revolutionize how people interact with real estate documents. By combining powerful AI with intuitive design, we help buyers, sellers, and agents extract critical information from contracts in seconds — not hours.</p>
                </div>

                <div className="about-values-grid">
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Shield size={24} /></div>
                        <h3>Trust & Transparency</h3>
                        <p>Every analysis is backed by clear data extraction with full visibility into how conclusions are reached.</p>
                    </div>
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Zap size={24} /></div>
                        <h3>Speed & Efficiency</h3>
                        <p>What used to take legal teams hours now takes seconds with our AI-powered document processing.</p>
                    </div>
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Target size={24} /></div>
                        <h3>Accuracy First</h3>
                        <p>Our NER models are trained specifically for real estate, achieving industry-leading extraction accuracy.</p>
                    </div>
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Users size={24} /></div>
                        <h3>User-Centered</h3>
                        <p>Designed for everyone — from first-time buyers to seasoned real estate professionals.</p>
                    </div>
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Globe size={24} /></div>
                        <h3>Accessibility</h3>
                        <p>Making complex property data accessible and understandable for everyone involved in a transaction.</p>
                    </div>
                    <div className="about-value-card card">
                        <div className="about-value-icon"><Award size={24} /></div>
                        <h3>Compliance Ready</h3>
                        <p>Built-in compliance verification ensures documents meet regulatory standards automatically.</p>
                    </div>
                </div>

                <div className="about-stats">
                    <div className="about-stat"><span>2,500+</span><p>Properties</p></div>
                    <div className="about-stat"><span>15K+</span><p>Documents Processed</p></div>
                    <div className="about-stat"><span>98%</span><p>Accuracy</p></div>
                    <div className="about-stat"><span>4.9★</span><p>User Rating</p></div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
