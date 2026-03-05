import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, FileText, Home, Building2, LayoutDashboard, Upload } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/marketplace', label: 'Marketplace', icon: Building2 },
        { path: '/about', label: 'About', icon: FileText },
        { path: '/contact', label: 'Contact', icon: FileText },
    ];

    const authLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/documents/upload', label: 'Upload', icon: Upload },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Estate<span>IQ</span>
                </Link>

                <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    {navLinks.map(({ path, label }) => (
                        <li key={path}>
                            <Link
                                to={path}
                                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    {user && authLinks.map(({ path, label }) => (
                        <li key={path}>
                            <Link
                                to={path}
                                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="user-avatar">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <span className="user-name">{user.firstName}</span>
                            </button>
                            {dropdownOpen && (
                                <div className="user-dropdown animate-fade-in">
                                    <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <LayoutDashboard size={16} /> Dashboard
                                    </Link>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <User size={16} /> Profile
                                    </Link>
                                    <Link to="/my-listings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <Building2 size={16} /> My Listings
                                    </Link>
                                    <hr className="dropdown-divider" />
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
