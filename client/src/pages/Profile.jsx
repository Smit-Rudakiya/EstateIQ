import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Mail, Phone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [tab, setTab] = useState('details');
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/profile', form);
            setUser({ ...user, ...res.data });
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await api.put('/profile/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
            toast.success('Password changed!');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page page">
            <div className="container">
                <div className="profile-header animate-fade-in">
                    <div className="profile-avatar-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                        <h1>{user?.firstName} {user?.lastName}</h1>
                        <p>@{user?.username} · {user?.role}</p>
                    </div>
                </div>

                <div className="profile-tabs">
                    <button className={`mp-tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>
                        <User size={16} /> User Details
                    </button>
                    <button className={`mp-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
                        <Lock size={16} /> Change Password
                    </button>
                </div>

                {tab === 'details' ? (
                    <form className="profile-form card animate-fade-in" onSubmit={handleUpdateProfile}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><Mail size={14} /> Email</label>
                            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><Phone size={14} /> Phone</label>
                            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0100" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                ) : (
                    <form className="profile-form card animate-fade-in" onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input type="password" className="form-input" placeholder="Enter current password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input type="password" className="form-input" placeholder="Min 6 characters" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input type="password" className="form-input" placeholder="Repeat new password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} required minLength={6} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Lock size={16} /> {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
