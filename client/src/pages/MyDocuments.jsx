import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Trash2, Clock, Brain, AlertTriangle, CheckCircle, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (err) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/documents/${deleteModal._id}`);
            toast.success('Document deleted');
            setDocuments(prev => prev.filter(d => d._id !== deleteModal._id));
            setDeleteModal(null);
        } catch (err) {
            toast.error('Failed to delete document');
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getStatusInfo = (status) => {
        const map = {
            uploaded: { cls: 'badge-primary', label: 'Uploaded', icon: FileText },
            analyzing: { cls: 'badge-warning', label: 'Analyzing...', icon: Clock },
            analyzed: { cls: 'badge-success', label: 'Analyzed', icon: Brain },
            failed: { cls: 'badge-danger', label: 'Failed', icon: AlertTriangle },
        };
        return map[status] || map.uploaded;
    };

    const filtered = documents.filter(d =>
        d.originalName.toLowerCase().includes(search.toLowerCase())
    );

    const analyzedCount = documents.filter(d => d.status === 'analyzed').length;

    return (
        <div className="page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
            <div className="container" style={{ maxWidth: '960px', padding: '32px 20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', margin: 0 }}>My Documents</h1>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: '14px' }}>
                            {documents.length} total · {analyzedCount} analyzed
                        </p>
                    </div>
                    <Link to="/documents/upload" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={16} /> Upload New
                    </Link>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px', border: '1px solid var(--border)',
                            background: 'var(--card-bg)', fontSize: '14px', outline: 'none', color: 'var(--dark)',
                        }}
                    />
                </div>

                {/* Documents List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <FileText size={40} color="var(--text-light)" />
                        <h3 style={{ marginTop: '16px' }}>{search ? 'No matching documents' : 'No documents yet'}</h3>
                        <p style={{ color: 'var(--text-light)' }}>{search ? 'Try a different search term.' : 'Upload your first document to get AI analysis.'}</p>
                        {!search && <Link to="/documents/upload" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Upload Document</Link>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filtered.map(doc => {
                            const statusInfo = getStatusInfo(doc.status);
                            return (
                                <div key={doc._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px',
                                    background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)',
                                    transition: 'all 0.2s', cursor: 'default',
                                }}>
                                    {/* File Icon */}
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                                        background: doc.fileType?.includes('pdf') ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                    }}>
                                        <FileText size={20} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {doc.originalName}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                                            {formatSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                                            {doc.property?.title && <> · <strong>{doc.property.title}</strong></>}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`badge ${statusInfo.cls}`} style={{ flexShrink: 0 }}>{statusInfo.label}</span>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        {doc.status === 'analyzed' && (
                                            <Link to={`/documents/${doc._id}`} style={{
                                                width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                                                textDecoration: 'none', background: 'var(--bg)',
                                            }} title="View Analysis">
                                                <Brain size={16} />
                                            </Link>
                                        )}
                                        <button onClick={() => setDeleteModal(doc)} style={{
                                            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444',
                                            cursor: 'pointer', background: 'var(--bg)',
                                        }} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Delete Document</h3>
                        <p>Are you sure you want to delete <strong>{deleteModal.originalName}</strong>?</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyDocuments;
