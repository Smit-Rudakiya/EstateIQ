import { useState, useEffect } from 'react';
import { Search, Trash2, Download, ChevronLeft, ChevronRight, FileText, File, FileImage } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteModal, setDeleteModal] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [page]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/documents', { params: { page, limit: 15 } });
            setDocuments(res.data.documents);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal && !isBulkDelete) return;

        try {
            if (isBulkDelete) {
                await api.post('/admin/documents/bulk-delete', { ids: selectedIds });
                toast.success(`Deleted ${selectedIds.length} documents`);
                setSelectedIds([]);
                setIsBulkDelete(false);
            } else {
                await api.delete(`/admin/documents/${deleteModal._id}`);
                toast.success('Document deleted');
                setDeleteModal(null);
            }
            fetchDocuments();
        } catch (err) {
            toast.error('Failed to delete document');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(documents.map(d => d._id));
        } else {
            setSelectedIds([]);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const getFileIcon = (type) => {
        if (type?.includes('pdf')) return <FileText size={20} />;
        if (type?.includes('image')) return <FileImage size={20} />;
        return <File size={20} />;
    };

    const getFileColor = (type) => {
        if (type?.includes('pdf')) return 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)';
        if (type?.includes('image')) return 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)';
        return 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)';
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Document Management</h1>
                <p>Check and manage all uploaded documents</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Documents</h3>
                </div>

                {selectedIds.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div className="bulk-info">
                            <span className="bulk-count">{selectedIds.length}</span>
                            <span>Documents selected</span>
                        </div>
                        <div className="bulk-btns">
                            <button className="btn btn-danger btn-sm" onClick={() => setIsBulkDelete(true)}>
                                <Trash2 size={16} /> Delete Selected
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds([])}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="admin-loading"><div className="admin-spinner"></div></div>
                ) : documents.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No documents uploaded</h3>
                        <p>No documents have been uploaded by users yet</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            onChange={handleSelectAll}
                                            checked={documents.length > 0 && selectedIds.length === documents.length}
                                        />
                                    </th>
                                    <th>Document</th>
                                    <th>Uploaded By</th>
                                    <th>Property</th>
                                    <th>Size</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((d) => (
                                    <tr key={d._id} className={selectedIds.includes(d._id) ? 'selected' : ''}>
                                        <td className="checkbox-cell">
                                            <input
                                                type="checkbox"
                                                className="custom-checkbox"
                                                checked={selectedIds.includes(d._id)}
                                                onChange={() => toggleSelect(d._id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="table-user">
                                                <div className="table-user-avatar" style={{ background: getFileColor(d.fileType) }}>
                                                    {getFileIcon(d.fileType)}
                                                </div>
                                                <div className="table-user-info">
                                                    <div className="table-user-name">{d.originalName}</div>
                                                    <div className="table-user-email">{d.fileType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {d.uploadedBy
                                                ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}`
                                                : '—'
                                            }
                                        </td>
                                        <td>{d.property?.title || '—'}</td>
                                        <td>{formatSize(d.fileSize)}</td>
                                        <td>
                                            <span className={`badge ${d.status === 'uploaded' ? 'badge-success' : 'badge-warning'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(d.createdAt)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <a
                                                    href={`http://localhost:5000/uploads/${d.fileName}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="table-action-btn"
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </a>
                                                <button
                                                    className="table-action-btn danger"
                                                    title="Delete Document"
                                                    onClick={() => setDeleteModal(d)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {pages > 1 && (
                            <div className="table-pagination">
                                <div className="pagination-info">Page {page} of {pages} ({total} documents)</div>
                                <div className="pagination-btns">
                                    <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                                        <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                    ))}
                                    <button className="pagination-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Delete Document</h3>
                        <p>Are you sure you want to delete <strong>{deleteModal.originalName}</strong>? The file will be permanently removed.</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Document</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {isBulkDelete && (
                <div className="modal-overlay" onClick={() => { setIsBulkDelete(false); setSelectedIds([]); }}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Bulk Delete Documents</h3>
                        <p>Are you sure you want to delete <strong>{selectedIds.length}</strong> selected documents? The files will be permanently removed.</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setIsBulkDelete(false)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDocuments;
