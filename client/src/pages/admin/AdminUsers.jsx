import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await api.get('/admin/users', { params });
            setUsers(res.data.users);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            toast.success(`User role changed to ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await api.delete(`/admin/users/${deleteModal._id}`);
            toast.success('User deleted');
            setDeleteModal(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>User Management</h1>
                <p>View, manage, and modify all registered users</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Users Total</h3>
                    <div className="admin-table-actions">
                        <form onSubmit={handleSearch} className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                className="search-input"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="admin-spinner"></div></div>
                ) : users.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No users found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Username</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="table-user">
                                                <div className="table-user-avatar">
                                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                                </div>
                                                <div className="table-user-info">
                                                    <div className="table-user-name">{u.firstName} {u.lastName}</div>
                                                    <div className="table-user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>@{u.username}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{formatDate(u.createdAt)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="table-action-btn"
                                                    title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                    onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                                                >
                                                    {u.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                                                </button>
                                                <button
                                                    className="table-action-btn danger"
                                                    title="Delete User"
                                                    onClick={() => setDeleteModal(u)}
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
                                    Page {page} of {pages} ({total} users)
                                </div>
                                <div className="pagination-btns">
                                    <button
                                        className="pagination-btn"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`pagination-btn ${page === p ? 'active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        className="pagination-btn"
                                        disabled={page >= pages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>⚠️ Delete User</h3>
                        <p>
                            Are you sure you want to delete <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> ({deleteModal.email})?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
