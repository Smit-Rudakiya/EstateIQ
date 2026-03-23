import { useState, useEffect } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Eye, ChevronUp, Building2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import React from 'react';

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
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
        fetchInquiries();
    }, [page, statusFilter]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/inquiries/admin/all', { params });
            setInquiries(res.data.inquiries);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal && !isBulkDelete) return;

        try {
            if (isBulkDelete) {
                await api.post('/inquiries/admin/bulk-delete', { ids: selectedIds });
                toast.success(`Deleted ${selectedIds.length} inquiries`);
                setSelectedIds([]);
                setIsBulkDelete(false);
            } else {
                await api.delete(`/inquiries/admin/${deleteModal._id}`);
                toast.success('Inquiry deleted');
                setDeleteModal(null);
            }
            fetchInquiries();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(inquiries.map(c => c._id));
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
        responded: 'badge-success'
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Property Inquiries</h1>
                <p>View all property inquiries across the platform</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Inquiries</h3>
                    <div className="admin-table-actions">
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="responded">Responded</option>
                        </select>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div className="bulk-info">
                            <span className="bulk-count">{selectedIds.length}</span>
                            <span>Inquiries selected</span>
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
                ) : inquiries.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No inquiries yet</h3>
                        <p>Property inquiries from buyers will appear here</p>
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
                                            checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                                        />
                                    </th>
                                    <th>From</th>
                                    <th>Property</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.map((inq) => (
                                    <React.Fragment key={inq._id}>
                                        <tr className={selectedIds.includes(inq._id) ? 'selected' : ''}>
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="custom-checkbox"
                                                    checked={selectedIds.includes(inq._id)}
                                                    onChange={() => toggleSelect(inq._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="table-user">
                                                    <div className="table-user-avatar" style={{
                                                        background: inq.status === 'new'
                                                            ? 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)'
                                                            : inq.status === 'responded'
                                                                ? 'linear-gradient(135deg, #10B981 0%, #065F46 100%)'
                                                                : 'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)'
                                                    }}>
                                                        {inq.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="table-user-info">
                                                        <div className="table-user-name">{inq.name}</div>
                                                        <div className="table-user-email">{inq.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                                    <Building2 size={14} color="var(--primary)" />
                                                    {inq.property?.title || 'Deleted Property'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>
                                                    {inq.owner ? `${inq.owner.firstName} ${inq.owner.lastName}` : 'Unknown'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusBadge[inq.status]}`}>{inq.status}</span>
                                            </td>
                                            <td style={{ fontSize: '13px' }}>{formatDate(inq.createdAt)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="table-action-btn"
                                                        title="View Message"
                                                        onClick={() => setExpandedId(expandedId === inq._id ? null : inq._id)}
                                                    >
                                                        {expandedId === inq._id ? <ChevronUp size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        className="table-action-btn danger"
                                                        title="Delete"
                                                        onClick={() => setDeleteModal(inq)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === inq._id && (
                                            <tr className={selectedIds.includes(inq._id) ? 'selected' : ''}>
                                                <td colSpan={7}>
                                                    <div className="message-detail">
                                                        <p>{inq.message}</p>
                                                        <div className="message-meta">
                                                            {inq.phone && <span>📞 {inq.phone}</span>}
                                                            <span>📧 {inq.email}</span>
                                                            {inq.property && <span>🏠 {inq.property.location?.city}, {inq.property.location?.state}</span>}
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
                                <div className="pagination-info">Page {page} of {pages} ({total} inquiries)</div>
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
                        <h3>⚠️ Delete Inquiry</h3>
                        <p>Are you sure you want to delete the inquiry from <strong>{deleteModal.name}</strong>?</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isBulkDelete && (
                <div className="modal-overlay" onClick={() => { setIsBulkDelete(false); setSelectedIds([]); }}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Bulk Delete Inquiries</h3>
                        <p>Are you sure you want to delete <strong>{selectedIds.length}</strong> selected inquiries? This cannot be undone.</p>
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

export default AdminInquiries;
