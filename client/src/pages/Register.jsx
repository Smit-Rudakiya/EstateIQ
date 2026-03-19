import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', username: '', email: '',
        countryCode: '+91', phone: '', password: '', confirmPassword: ''
    });

    const validateForm = () => {
        const errors = [];
        const { firstName, lastName, username, email, phone, password } = form;

        if (firstName.trim().length < 2) errors.push('First name must be at least 2 characters');
        if (lastName.trim().length < 2) errors.push('Last name must be at least 2 characters');
        if (!/^[a-zA-Z0-9]{3,}$/.test(username)) errors.push('Username must be at least 3 alphanumeric characters');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address');
        if (phone && !/^[6-9]\d{9}$/.test(phone)) errors.push('Please enter a valid 10-digit Indian phone number');

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            errors.push('Password: 8+ chars with Uppercase, Lowercase, Number, and Special character');
        }

        if (password !== form.confirmPassword) errors.push('Passwords do not match');

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            validationErrors.forEach(err => toast.error(err));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                email: form.email,
                phone: form.phone ? `${form.countryCode} ${form.phone}` : '',
                password: form.password
            };
            await register(payload);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth-container-wide animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">Estate<span>IQ</span></div>
                    <h1>Create Account</h1>
                    <p>Join EstateIQ for intelligent property management</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input type="text" name="firstName" className="form-input" placeholder="Rahul" value={form.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input type="text" name="lastName" className="form-input" placeholder="Sharma" value={form.lastName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" name="username" className="form-input" placeholder="rahulsharma" value={form.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" placeholder="rahul@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="phone-input-group">
                            <select name="countryCode" className="form-input country-code-select" value={form.countryCode} onChange={handleChange}>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+971">🇦🇪 +971</option>
                                <option value="+65">🇸🇬 +65</option>
                                <option value="+61">🇦🇺 +61</option>
                                <option value="+81">🇯🇵 +81</option>
                                <option value="+49">🇩🇪 +49</option>
                                <option value="+86">🇨🇳 +86</option>
                                <option value="+33">🇫🇷 +33</option>
                            </select>
                            <input type="tel" name="phone" className="form-input" placeholder="98765 43210" value={form.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <input type={showPass ? 'text' : 'password'} name="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                            <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-with-icon">
                            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
                            <button type="button" className="input-icon-btn" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {form.confirmPassword && form.password !== form.confirmPassword && (
                            <p className="field-error">Passwords do not match</p>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}>
                        <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
