import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Building2, MessageSquare, MessageCircle,
    FileText, ClipboardList, LogOut, ChevronLeft, ChevronRight, Building
} from 'lucide-react';

const AdminSidebar = ({ collapsed, onToggle }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/properties', label: 'Properties', icon: Building2 },
        { path: '/admin/inquiries', label: 'Inquiries', icon: MessageCircle },
        { path: '/admin/contacts', label: 'Contacts', icon: MessageSquare },
        { path: '/admin/documents', label: 'Documents', icon: FileText },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
    ];

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Building size={20} />
                    </div>
                    <div>
                        <div className="sidebar-logo-text">Estate<span>IQ</span></div>
                        <div className="sidebar-admin-label">Admin Panel</div>
                    </div>
                </div>
                <button className="sidebar-toggle" onClick={onToggle}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-title">Main Menu</div>
                {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`nav-item ${isActive(path) ? 'active' : ''}`}
                    >
                        <span className="nav-icon"><Icon size={19} /></span>
                        <span className="nav-label">{label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
                        <div className="sidebar-user-role">Administrator</div>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
