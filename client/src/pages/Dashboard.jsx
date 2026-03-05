import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, FileText, Upload, Bell, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ properties: 0, documents: 0 });
    const [recentDocs, setRecentDocs] = useState([]);
    const [recentProps, setRecentProps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propsRes, docsRes] = await Promise.all([
                    api.get('/properties/my/listings'),
                    api.get('/documents')
                ]);
                setRecentProps(propsRes.data.slice(0, 5));
                setRecentDocs(docsRes.data.slice(0, 5));
                setStats({ properties: propsRes.data.length, documents: docsRes.data.length });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatSize = (bytes) => {
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1024).toFixed(0) + ' KB';
    };

    return (
        <div className="dashboard-page page">
            <div className="container">
                {/* Header */}
                <div className="dash-header animate-fade-in">
                    <div>
                        <h1>Welcome back, <span className="gradient-text">{user?.firstName}</span>! 👋</h1>
                        <p>Here's what's happening with your properties and documents.</p>
                    </div>
                    <div className="dash-header-actions">
                        <Link to="/documents/upload" className="btn btn-primary btn-sm"><Upload size={16} /> Upload Doc</Link>
                        <Link to="/my-listings" className="btn btn-outline btn-sm"><Building2 size={16} /> My Listings</Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="dash-stats stagger-children">
                    <div className="dash-stat-card animate-fade-in-up hover-lift">
                        <div className="dash-stat-icon" style={{ background: 'var(--accent-bg)' }}><Building2 size={22} color="var(--primary)" /></div>
                        <div>
                            <div className="dash-stat-value">{stats.properties}</div>
                            <div className="dash-stat-label">My Properties</div>
                        </div>
                    </div>
                    <div className="dash-stat-card animate-fade-in-up hover-lift">
                        <div className="dash-stat-icon" style={{ background: 'var(--success-bg)' }}><FileText size={22} color="var(--success)" /></div>
                        <div>
                            <div className="dash-stat-value">{stats.documents}</div>
                            <div className="dash-stat-label">Documents</div>
                        </div>
                    </div>
                    <div className="dash-stat-card animate-fade-in-up hover-lift">
                        <div className="dash-stat-icon" style={{ background: 'var(--warning-bg)' }}><Bell size={22} color="var(--warning)" /></div>
                        <div>
                            <div className="dash-stat-value">0</div>
                            <div className="dash-stat-label">Alerts</div>
                        </div>
                    </div>
                    <div className="dash-stat-card animate-fade-in-up hover-lift">
                        <div className="dash-stat-icon" style={{ background: '#EDE9FE' }}><TrendingUp size={22} color="#7C3AED" /></div>
                        <div>
                            <div className="dash-stat-value">—</div>
                            <div className="dash-stat-label">Analytics</div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="dash-grid">
                    {/* Recent Documents */}
                    <div className="dash-section animate-fade-in-up">
                        <div className="dash-section-header">
                            <h3><FileText size={18} /> Recent Documents</h3>
                            <Link to="/documents/upload" className="auth-link">View All →</Link>
                        </div>
                        {loading ? (
                            <div className="dash-loading">Loading...</div>
                        ) : recentDocs.length === 0 ? (
                            <div className="dash-empty">
                                <p>No documents uploaded yet</p>
                                <Link to="/documents/upload" className="btn btn-primary btn-sm"><Upload size={14} /> Upload First Document</Link>
                            </div>
                        ) : (
                            <div className="dash-list">
                                {recentDocs.map(doc => (
                                    <div key={doc._id} className="dash-list-item">
                                        <div className="dash-list-icon"><FileText size={18} /></div>
                                        <div className="dash-list-info">
                                            <div className="dash-list-title">{doc.originalName}</div>
                                            <div className="dash-list-meta"><Clock size={12} /> {formatDate(doc.createdAt)} · {formatSize(doc.fileSize)}</div>
                                        </div>
                                        <span className="badge badge-primary">{doc.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Properties */}
                    <div className="dash-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="dash-section-header">
                            <h3><Building2 size={18} /> My Properties</h3>
                            <Link to="/my-listings" className="auth-link">View All →</Link>
                        </div>
                        {loading ? (
                            <div className="dash-loading">Loading...</div>
                        ) : recentProps.length === 0 ? (
                            <div className="dash-empty">
                                <p>No properties listed yet</p>
                                <Link to="/my-listings" className="btn btn-primary btn-sm"><Building2 size={14} /> Add Property</Link>
                            </div>
                        ) : (
                            <div className="dash-list">
                                {recentProps.map(prop => (
                                    <Link to={`/properties/${prop._id}`} key={prop._id} className="dash-list-item">
                                        <div className="dash-list-icon"><Building2 size={18} /></div>
                                        <div className="dash-list-info">
                                            <div className="dash-list-title">{prop.title}</div>
                                            <div className="dash-list-meta">{prop.location.city}, {prop.location.state}</div>
                                        </div>
                                        <span className={`badge ${prop.type === 'buy' ? 'badge-primary' : 'badge-success'}`}>
                                            {prop.type === 'buy' ? 'Sale' : 'Rent'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
