import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.username, form.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">Estate<span>IQ</span></div>
                    <h1>Welcome Back 👋</h1>
                    <p>Sign in to access your properties and documents</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="auth-actions">
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                        <LogIn size={18} /> {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
                </div>
                <div className="auth-demo-hint">
                    <p>Demo: <strong>demo</strong> / <strong>demo123</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
