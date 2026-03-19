import { useState, useEffect } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, [page, statusFilter]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/admin/properties', { params });
            setProperties(res.data.properties);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProperties();
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/admin/properties/${id}`, { status: newStatus });
            toast.success(`Property status changed to ${newStatus}`);
            fetchProperties();
        } catch (err) {
            toast.error('Failed to update property');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/admin/properties/${deleteModal._id}`);
            toast.success('Property deleted');
            setDeleteModal(null);
            fetchProperties();
        } catch (err) {
            toast.error('Failed to delete property');
        }
    };

    const formatPrice = (price) => {
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
        return `₹${price?.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const statusColors = {
        active: 'badge-success',
        pending: 'badge-warning',
        sold: 'badge-primary',
        rented: 'badge-primary'
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Property Management</h1>
                <p>Manage all property listings across the platform</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Properties</h3>
                    <div className="admin-table-actions">
                        <form onSubmit={handleSearch} className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                className="search-input"
                                placeholder="Search properties..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                            <option value="rented">Rented</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="admin-spinner"></div></div>
                ) : properties.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No properties found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Listed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="table-user">
                                                {p.images?.[0] ? (
                                                    <img
                                                        src={`http://localhost:5000${p.images[0]}`}
                                                        alt=""
                                                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="table-user-avatar" style={{ background: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)' }}>
                                                        {p.title?.[0]}
                                                    </div>
                                                )}
                                                <div className="table-user-info">
                                                    <div className="table-user-name">{p.title}</div>
                                                    <div className="table-user-email">{p.location?.city}, {p.location?.state}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">{p.type}</span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--dark)' }}>{formatPrice(p.price)}</td>
                                        <td>{p.owner ? `${p.owner.firstName} ${p.owner.lastName}` : '—'}</td>
                                        <td>
                                            <select
                                                className="filter-select"
                                                value={p.status}
                                                onChange={(e) => handleStatusChange(p._id, e.target.value)}
                                                style={{ padding: '4px 28px 4px 8px', fontSize: '12px' }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="sold">Sold</option>
                                                <option value="rented">Rented</option>
                                            </select>
                                        </td>
                                        <td>{formatDate(p.createdAt)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <a
                                                    href={`/properties/${p._id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="table-action-btn"
                                                    title="View Property"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                                <button
                                                    className="table-action-btn danger"
                                                    title="Delete Property"
                                                    onClick={() => setDeleteModal(p)}
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
                                <div className="pagination-info">
                                    Page {page} of {pages} ({total} properties)
                                </div>
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
                        <h3>⚠️ Delete Property</h3>
                        <p>Are you sure you want to delete <strong>{deleteModal.title}</strong>? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Property</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProperties;
