import { useState, useEffect } from 'react';
import { Building2, MessageCircle, Clock, CheckCircle, Eye, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css'; // Reuse dashboard styles

const SentInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await api.get('/inquiries/sent');
            setInquiries(res.data.inquiries);
        } catch (err) {
            toast.error('Failed to load sent inquiries');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const statusBadge = {
        new: 'badge-danger',
        read: 'badge-warning',
        responded: 'badge-success'
    };

    return (
        <div className="page dashboard-page" style={{ paddingTop: '80px', minHeight: 'calc(100vh - 60px)' }}>
            <div className="container">
                <div className="dash-header" style={{ marginBottom: '24px' }}>
                    <div>
                        <h1>Sent Inquiries</h1>
                        <p className="text-muted">Track the status of inquiries you've sent to property owners.</p>
                    </div>
                </div>

                <div className="dash-section animate-fade-in-up">
                    {loading ? (
                        <div className="dash-loading">Loading...</div>
                    ) : inquiries.length === 0 ? (
                        <div className="dash-empty">
                            <MessageCircle size={32} color="var(--text-light)" style={{ marginBottom: '12px' }} />
                            <p>You haven't sent any inquiries yet.</p>
                            <Link to="/marketplace" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Browse Properties</Link>
                        </div>
                    ) : (
                        <div className="dash-inquiry-list">
                            {inquiries.map(inq => (
                                <div key={inq._id} className="dash-inquiry-item">
                                    <div className="dash-inquiry-top">
                                        <div className="dash-inquiry-sender">
                                            <div className="dash-inquiry-avatar" style={{ background: 'var(--primary-dark)' }}>
                                                <Building2 size={16} color="white" />
                                            </div>
                                            <div>
                                                <div className="dash-inquiry-name" style={{ fontSize: '15px' }}>
                                                    <Link to={`/properties/${inq.property?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {inq.property?.title || 'Unknown Property'}
                                                    </Link>
                                                </div>
                                                <div className="dash-inquiry-meta">
                                                    Owner: {inq.owner?.firstName} {inq.owner?.lastName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dash-inquiry-right">
                                            <span className={`badge ${statusBadge[inq.status]}`}>
                                                {inq.status === 'new' ? 'Delivered' : inq.status === 'read' ? 'Seen' : 'Responded'}
                                            </span>
                                            <span className="dash-inquiry-time">{formatTimeAgo(inq.createdAt)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="reply-original-message" style={{ marginTop: '12px', background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                                        <strong>Your Message:</strong>
                                        <p style={{ marginTop: '4px' }}>{inq.message}</p>
                                    </div>

                                    {inq.response && (
                                        <div className="dash-inquiry-response" style={{ marginTop: '12px', borderLeftColor: 'var(--success)' }}>
                                            <div className="dash-inquiry-response-label" style={{ color: 'var(--success)' }}>
                                                <Reply size={12} /> Owner's Response:
                                            </div>
                                            <div className="dash-inquiry-response-text">{inq.response}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                                Received {formatTimeAgo(inq.respondedAt)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SentInquiries;
