import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">Estate<span>IQ</span></div>
                        <p>India's smartest AI-powered property intelligence platform. Transforming how real estate professionals work.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <Link to="/marketplace">Marketplace</Link>
                        <Link to="/documents/upload">Document Upload</Link>
                        <Link to="/dashboard">Dashboard</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Account</h4>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Sign Up</Link>
                        <Link to="/profile">Profile</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 EstateIQ — Built with <Heart size={14} className="footer-heart" /> in India</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
