import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import './Admin.css';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="admin-loading" style={{ minHeight: '100vh' }}>
                <div className="admin-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
