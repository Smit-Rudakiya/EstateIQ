import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building2, FileText, Upload, MessageCircle, TrendingUp, Clock, CheckCircle, Eye, Send, X, Reply } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ properties: 0, documents: 0, inquiries: 0, newInquiries: 0 });
    const [recentDocs, setRecentDocs] = useState([]);
    const [recentProps, setRecentProps] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propsRes, docsRes, inquiriesRes] = await Promise.all([
                    api.get('/properties/my/listings'),
                    api.get('/documents'),
                    api.get('/inquiries/received')
                ]);
                setRecentProps(propsRes.data.slice(0, 5));
                setRecentDocs(docsRes.data.slice(0, 5));
                setInquiries(inquiriesRes.data.inquiries || []);
                setStats({
                    properties: propsRes.data.length,
                    documents: docsRes.data.length,
                    inquiries: inquiriesRes.data.total || 0,
                    newInquiries: inquiriesRes.data.newCount || 0
                });
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
    const formatTimeAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleSendResponse = async () => {
        if (!replyText.trim() || !replyModal) return;
        setSendingReply(true);
        try {
            const res = await api.put(`/inquiries/${replyModal._id}/respond`, { response: replyText.trim() });
            toast.success('Response sent!');
            setInquiries(prev => prev.map(inq =>
                inq._id === replyModal._id ? { ...inq, status: 'responded', response: replyText.trim(), respondedAt: new Date().toISOString() } : inq
            ));
            setStats(prev => ({ ...prev, newInquiries: Math.max(0, prev.newInquiries - 1) }));
            setReplyModal(null);
            setReplyText('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send response');
        } finally {
            setSendingReply(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/inquiries/${id}/status`, { status: 'read' });
            setInquiries(prev => prev.map(inq =>
                inq._id === id ? { ...inq, status: 'read' } : inq
            ));
            setStats(prev => ({ ...prev, newInquiries: Math.max(0, prev.newInquiries - 1) }));
        } catch (err) {
            console.error(err);
        }
    };

    const statusBadge = {
        new: 'badge-danger',
        read: 'badge-warning',
        responded: 'badge-success'
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
                        <div className="dash-stat-icon" style={{ background: 'var(--warning-bg)' }}><MessageCircle size={22} color="var(--warning)" /></div>
                        <div>
                            <div className="dash-stat-value">
                                {stats.inquiries}
                                {stats.newInquiries > 0 && <span className="dash-stat-badge">{stats.newInquiries} new</span>}
                            </div>
                            <div className="dash-stat-label">Inquiries</div>
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
                    {/* Property Inquiries */}
                    <div className="dash-section animate-fade-in-up">
                        <div className="dash-section-header">
                            <h3><MessageCircle size={18} /> Property Inquiries</h3>
                        </div>
                        {loading ? (
                            <div className="dash-loading">Loading...</div>
                        ) : inquiries.length === 0 ? (
                            <div className="dash-empty">
                                <p>No inquiries received yet</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>When someone inquires about your property, it'll show up here</p>
                            </div>
                        ) : (
                            <div className="dash-inquiry-list">
                                {inquiries.slice(0, 6).map(inq => (
                                    <div key={inq._id} className={`dash-inquiry-item ${inq.status === 'new' ? 'is-new' : ''}`}>
                                        <div className="dash-inquiry-top">
                                            <div className="dash-inquiry-sender">
                                                <div className="dash-inquiry-avatar">{inq.name?.[0]?.toUpperCase()}</div>
                                                <div>
                                                    <div className="dash-inquiry-name">{inq.name}</div>
                                                    <div className="dash-inquiry-meta">{inq.email}</div>
                                                </div>
                                            </div>
                                            <div className="dash-inquiry-right">
                                                <span className={`badge ${statusBadge[inq.status]}`}>{inq.status}</span>
                                                <span className="dash-inquiry-time">{formatTimeAgo(inq.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="dash-inquiry-property">
                                            <Building2 size={13} /> {inq.property?.title || 'Unknown Property'}
                                        </div>
                                        <div className="dash-inquiry-message">{inq.message}</div>
                                        {inq.phone && <div className="dash-inquiry-phone">📞 {inq.phone}</div>}
                                        {inq.response && (
                                            <div className="dash-inquiry-response">
                                                <div className="dash-inquiry-response-label"><Reply size={12} /> Your Response:</div>
                                                <div className="dash-inquiry-response-text">{inq.response}</div>
                                            </div>
                                        )}
                                        <div className="dash-inquiry-actions">
                                            {inq.status === 'new' && (
                                                <button className="btn btn-outline btn-xs" onClick={() => handleMarkRead(inq._id)}>
                                                    <Eye size={13} /> Mark Read
                                                </button>
                                            )}
                                            {inq.status !== 'responded' ? (
                                                <button className="btn btn-primary btn-xs" onClick={() => { setReplyModal(inq); setReplyText(''); }}>
                                                    <Send size={13} /> Reply
                                                </button>
                                            ) : (
                                                <button className="btn btn-outline btn-xs" onClick={() => { setReplyModal(inq); setReplyText(inq.response || ''); }}>
                                                    <Reply size={13} /> Edit Reply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Properties & Documents */}
                    <div>
                        {/* Recent Documents */}
                        <div className="dash-section animate-fade-in-up" style={{ marginBottom: '24px' }}>
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
                        <div className="dash-section animate-fade-in-up">
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

            {/* Reply Modal */}
            {replyModal && (
                <div className="inquiry-overlay" onClick={() => setReplyModal(null)}>
                    <div className="inquiry-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <button className="inquiry-close" onClick={() => setReplyModal(null)}>
                            <X size={20} />
                        </button>
                        <div className="inquiry-header">
                            <Send size={20} className="inquiry-header-icon" />
                            <div>
                                <h3>Reply to Inquiry</h3>
                                <p>From: <strong>{replyModal.name}</strong> ({replyModal.email})</p>
                            </div>
                        </div>
                        <div className="reply-inquiry-detail">
                            <div className="reply-property-name">
                                <Building2 size={14} /> {replyModal.property?.title || 'Property'}
                            </div>
                            <div className="reply-original-message">
                                <strong>Their message:</strong>
                                <p>{replyModal.message}</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Response</label>
                            <textarea
                                className="form-input"
                                rows={4}
                                placeholder="Type your response to this inquiry..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={sendingReply || !replyText.trim()}
                            onClick={handleSendResponse}
                        >
                            <Send size={16} /> {sendingReply ? 'Sending...' : 'Send Response'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
