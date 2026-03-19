import { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle, ChevronLeft, ChevronRight, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import React from 'react';

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [page, statusFilter]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/admin/contacts', { params });
            setContacts(res.data.contacts);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await api.put(`/admin/contacts/${id}`, { status: 'resolved' });
            toast.success('Contact marked as resolved');
            fetchContacts();
        } catch (err) {
            toast.error('Failed to update contact');
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/admin/contacts/${id}`, { status: 'read' });
            fetchContacts();
        } catch (err) {
            toast.error('Failed to update contact');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal && !isBulkDelete) return;

        try {
            if (isBulkDelete) {
                await api.post('/admin/contacts/bulk-delete', { ids: selectedIds });
                toast.success(`Deleted ${selectedIds.length} messages`);
                setSelectedIds([]);
                setIsBulkDelete(false);
            } else {
                await api.delete(`/admin/contacts/${deleteModal._id}`);
                toast.success('Contact deleted');
                setDeleteModal(null);
            }
            fetchContacts();
        } catch (err) {
            toast.error('Failed to delete contact');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(contacts.map(c => c._id));
        } else {
            setSelectedIds([]);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusBadge = {
        new: 'badge-danger',
        read: 'badge-warning',
        resolved: 'badge-success'
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Contact Queries</h1>
                <p>Manage contact form submissions and inquiries</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Queries</h3>
                    <div className="admin-table-actions">
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div className="bulk-info">
                            <span className="bulk-count">{selectedIds.length}</span>
                            <span>Messages selected</span>
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
                ) : contacts.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No contact queries</h3>
                        <p>No messages have been received yet</p>
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
                                            checked={contacts.length > 0 && selectedIds.length === contacts.length}
                                        />
                                    </th>
                                    <th>From</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((c) => (
                                    <React.Fragment key={c._id}>
                                        <tr className={selectedIds.includes(c._id) ? 'selected' : ''}>
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="custom-checkbox"
                                                    checked={selectedIds.includes(c._id)}
                                                    onChange={() => toggleSelect(c._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="table-user">
                                                    <div className="table-user-avatar" style={{
                                                        background: c.status === 'new'
                                                            ? 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)'
                                                            : c.status === 'resolved'
                                                                ? 'linear-gradient(135deg, #10B981 0%, #065F46 100%)'
                                                                : 'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)'
                                                    }}>
                                                        {c.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="table-user-info">
                                                        <div className="table-user-name">{c.name}</div>
                                                        <div className="table-user-email">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: c.status === 'new' ? 700 : 400 }}>{c.subject}</td>
                                            <td>
                                                <span className={`badge ${statusBadge[c.status]}`}>{c.status}</span>
                                            </td>
                                            <td style={{ fontSize: '13px' }}>{formatDate(c.createdAt)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="table-action-btn"
                                                        title="View Message"
                                                        onClick={() => {
                                                            setExpandedId(expandedId === c._id ? null : c._id);
                                                            if (c.status === 'new') handleMarkRead(c._id);
                                                        }}
                                                    >
                                                        {expandedId === c._id ? <ChevronUp size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    {c.status !== 'resolved' && (
                                                        <button
                                                            className="table-action-btn"
                                                            title="Mark Resolved"
                                                            onClick={() => handleResolve(c._id)}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="table-action-btn danger"
                                                        title="Delete"
                                                        onClick={() => setDeleteModal(c)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === c._id && (
                                            <tr className={selectedIds.includes(c._id) ? 'selected' : ''}>
                                                <td colSpan={6}>
                                                    <div className="message-detail">
                                                        <p>{c.message}</p>
                                                        <div className="message-meta">
                                                            {c.phone && <span>📞 {c.phone}</span>}
                                                            <span>📧 {c.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {pages > 1 && (
                            <div className="table-pagination">
                                <div className="pagination-info">Page {page} of {pages} ({total} queries)</div>
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
                        <h3>⚠️ Delete Contact</h3>
                        <p>Are you sure you want to delete the message from <strong>{deleteModal.name}</strong>?</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {isBulkDelete && (
                <div className="modal-overlay" onClick={() => { setIsBulkDelete(false); setSelectedIds([]); }}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Bulk Delete Queries</h3>
                        <p>Are you sure you want to delete <strong>{selectedIds.length}</strong> selected messages? This action cannot be undone.</p>
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

export default AdminContacts;
