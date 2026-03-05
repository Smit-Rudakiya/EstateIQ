import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">Estate<span>IQ</span></div>
                    <h1>Forgot Password</h1>
                    <p>Enter your email and we'll send you a reset link</p>
                </div>
                {sent ? (
                    <div className="auth-success">
                        <div className="success-icon">✉️</div>
                        <h3>Check Your Email</h3>
                        <p>We've sent a password reset link to <strong>{email}</strong></p>
                        <Link to="/login" className="btn btn-primary btn-lg auth-submit">
                            <ArrowLeft size={18} /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                            <Mail size={18} /> {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <div className="auth-footer">
                    <p><Link to="/login" className="auth-link"><ArrowLeft size={14} /> Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
