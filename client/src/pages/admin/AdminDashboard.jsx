import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Users, Building2, FileText, MessageSquare,
    TrendingUp, ArrowRight, UserPlus, Eye, ClipboardCheck
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const getActionLabel = (action) => {
        const labels = {
            user_created: 'New user registered',
            user_updated: 'User updated',
            user_deleted: 'User deleted',
            user_role_changed: 'User role changed',
            property_updated: 'Property updated',
            property_deleted: 'Property deleted',
            property_status_changed: 'Property status changed',
            document_deleted: 'Document deleted',
            contact_resolved: 'Contact resolved',
            contact_deleted: 'Contact deleted',
            admin_login: 'Admin login'
        };
        return labels[action] || action;
    };

    const getActivityColor = (action) => {
        if (action?.includes('delete')) return 'red';
        if (action?.includes('user')) return 'green';
        if (action?.includes('property')) return 'orange';
        return '';
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
            </div>
        );
    }

    const stats = data?.stats || {};

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Welcome back, {user?.firstName} 👋</h1>
                <p>Here's what's happening with EstateIQ today</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid stagger-children">
                <div className="stat-card animate-fade-in-up">
                    <div className="stat-card-header">
                        <div className="stat-icon blue"><Users size={22} /></div>
                        {stats.newUsers30d > 0 && (
                            <span className="stat-change positive">+{stats.newUsers30d} new</span>
                        )}
                    </div>
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>

                <div className="stat-card animate-fade-in-up">
                    <div className="stat-card-header">
                        <div className="stat-icon green"><Building2 size={22} /></div>
                        {stats.newProperties30d > 0 && (
                            <span className="stat-change positive">+{stats.newProperties30d} new</span>
                        )}
                    </div>
                    <div className="stat-value">{stats.totalProperties || 0}</div>
                    <div className="stat-label">Total Properties</div>
                </div>

                <div className="stat-card animate-fade-in-up">
                    <div className="stat-card-header">
                        <div className="stat-icon orange"><FileText size={22} /></div>
                        {stats.newDocuments30d > 0 && (
                            <span className="stat-change positive">+{stats.newDocuments30d} new</span>
                        )}
                    </div>
                    <div className="stat-value">{stats.totalDocuments || 0}</div>
                    <div className="stat-label">Total Documents</div>
                </div>

                <div className="stat-card animate-fade-in-up">
                    <div className="stat-card-header">
                        <div className="stat-icon red"><MessageSquare size={22} /></div>
                        {stats.newContacts30d > 0 && (
                            <span className="stat-change positive">+{stats.newContacts30d} new</span>
                        )}
                    </div>
                    <div className="stat-value">{stats.totalContacts || 0}</div>
                    <div className="stat-label">Contact Queries</div>
                </div>
            </div>

            {/* Grid: Recent Activity + Quick Actions */}
            <div className="admin-grid">
                {/* Recent Activity */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <h3><TrendingUp size={18} /> Recent Activity</h3>
                        <Link to="/admin/audit-logs" className="btn btn-ghost btn-sm">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="admin-section-body">
                        <div className="activity-timeline">
                            {data?.recentActivity && data.recentActivity.length > 0 ? (
                                data.recentActivity.slice(0, 6).map((item, i) => (
                                    <div key={i} className="activity-item">
                                        <div className={`activity-dot ${getActivityColor(item.action)}`}></div>
                                        <div className="activity-content">
                                            <div className="activity-text">
                                                <strong>{getActionLabel(item.action)}</strong>
                                                {item.details && ` — ${item.details}`}
                                            </div>
                                            <div className="activity-time">
                                                {item.adminUser && `${item.adminUser.firstName} ${item.adminUser.lastName} • `}
                                                {formatTime(item.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {/* Show recent users as activity if no audit logs yet */}
                                    {data?.recentUsers?.map((u, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-dot green"></div>
                                            <div className="activity-content">
                                                <div className="activity-text">
                                                    <strong>New user registered</strong> — {u.firstName} {u.lastName} ({u.username})
                                                </div>
                                                <div className="activity-time">{formatTime(u.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {data?.recentProperties?.map((p, i) => (
                                        <div key={`p-${i}`} className="activity-item">
                                            <div className="activity-dot orange"></div>
                                            <div className="activity-content">
                                                <div className="activity-text">
                                                    <strong>New property listed</strong> — {p.title}
                                                </div>
                                                <div className="activity-time">{formatTime(p.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <h3>⚡ Quick Actions</h3>
                    </div>
                    <div className="admin-section-body">
                        <div className="quick-actions">
                            <Link to="/admin/users" className="quick-action-btn">
                                <div className="quick-action-icon"><UserPlus size={20} /></div>
                                <span className="quick-action-label">Manage Users</span>
                            </Link>
                            <Link to="/admin/properties" className="quick-action-btn">
                                <div className="quick-action-icon"><Eye size={20} /></div>
                                <span className="quick-action-label">View Properties</span>
                            </Link>
                            <Link to="/admin/documents" className="quick-action-btn">
                                <div className="quick-action-icon"><ClipboardCheck size={20} /></div>
                                <span className="quick-action-label">Check Documents</span>
                            </Link>
                        </div>

                        {/* Recent Users Table */}
                        {data?.recentUsers && data.recentUsers.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', marginBottom: '12px' }}>
                                    Newest Users
                                </h4>
                                {data.recentUsers.slice(0, 4).map((u, i) => (
                                    <div key={i} className="table-user" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div className="table-user-avatar">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                                        <div className="table-user-info">
                                            <div className="table-user-name">{u.firstName} {u.lastName}</div>
                                            <div className="table-user-email">{u.email} • {u.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
