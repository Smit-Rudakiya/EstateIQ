import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 20 };
            if (actionFilter) params.action = actionFilter;
            const res = await api.get('/admin/audit-logs', { params });
            setLogs(res.data.logs);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const actionLabels = {
        user_created: { label: 'User Created', color: 'badge-success' },
        user_updated: { label: 'User Updated', color: 'badge-primary' },
        user_deleted: { label: 'User Deleted', color: 'badge-danger' },
        user_role_changed: { label: 'Role Changed', color: 'badge-warning' },
        property_updated: { label: 'Property Updated', color: 'badge-primary' },
        property_deleted: { label: 'Property Deleted', color: 'badge-danger' },
        property_status_changed: { label: 'Status Changed', color: 'badge-warning' },
        document_deleted: { label: 'Document Deleted', color: 'badge-danger' },
        contact_resolved: { label: 'Contact Resolved', color: 'badge-success' },
        contact_deleted: { label: 'Contact Deleted', color: 'badge-danger' },
        admin_login: { label: 'Admin Login', color: 'badge-primary' }
    };

    const allActions = Object.keys(actionLabels);

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <h1>Audit Logs</h1>
                <p>Track all admin actions and system events</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>{total} Log Entries</h3>
                    <div className="admin-table-actions">
                        <select
                            className="filter-select"
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Actions</option>
                            {allActions.map(a => (
                                <option key={a} value={a}>{actionLabels[a].label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="admin-spinner"></div></div>
                ) : logs.length === 0 ? (
                    <div className="admin-empty">
                        <Filter size={40} style={{ marginBottom: 12, color: 'var(--text-light)' }} />
                        <h3>No audit logs</h3>
                        <p>Admin actions will appear here as they are performed</p>
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Details</th>
                                    <th>Admin</th>
                                    <th>Target</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const actionInfo = actionLabels[log.action] || { label: log.action, color: 'badge-primary' };
                                    return (
                                        <tr key={log._id}>
                                            <td>
                                                <span className={`badge ${actionInfo.color}`}>
                                                    {actionInfo.label}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.details || '—'}
                                            </td>
                                            <td>
                                                {log.adminUser
                                                    ? `${log.adminUser.firstName} ${log.adminUser.lastName}`
                                                    : '—'
                                                }
                                            </td>
                                            <td>
                                                <span className="badge badge-primary">{log.targetType || '—'}</span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {formatDate(log.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {pages > 1 && (
                            <div className="table-pagination">
                                <div className="pagination-info">Page {page} of {pages} ({total} logs)</div>
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
        </div>
    );
};

export default AdminAuditLogs;
