import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Bath, Maximize, Building2, User, Mail, Phone, ChevronLeft, ChevronRight, Camera, Send, X, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatINR } from '../utils/formatINR';
import toast from 'react-hot-toast';
import './PropertyDetail.css';

const API_BASE = 'http://localhost:5000';

const PropertyDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquirySent, setInquirySent] = useState(false);
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        name: '', email: '', phone: '', message: ''
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await api.get(`/properties/${id}`);
                setProperty(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    // Pre-fill form if logged in
    useEffect(() => {
        if (user && property) {
            setInquiryForm(prev => ({
                ...prev,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                phone: user.phone || '',
                message: prev.message || `Hi, I'm interested in "${property.title}" listed at ${formatINR(property.price, property.type)}. Please share more details.`
            }));
        }
    }, [user, property]);

    const handleSendInquiry = async (e) => {
        e.preventDefault();
        setSendingInquiry(true);
        try {
            await api.post('/inquiries', {
                propertyId: property._id,
                name: inquiryForm.name,
                email: inquiryForm.email,
                phone: inquiryForm.phone || undefined,
                message: inquiryForm.message
            });
            setInquirySent(true);
            toast.success('Inquiry sent to property owner!');
        } catch (err) {
            toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to send inquiry');
        } finally {
            setSendingInquiry(false);
        }
    };

    if (loading) return <div className="pd-page page"><div className="container"><div className="dash-loading">Loading property...</div></div></div>;
    if (!property) return <div className="pd-page page"><div className="container"><div className="mp-empty"><h3>Property not found</h3></div></div></div>;

    const hasImages = property.images?.length > 0;

    const nextImage = () => setActiveImage(i => (i + 1) % property.images.length);
    const prevImage = () => setActiveImage(i => (i - 1 + property.images.length) % property.images.length);

    return (
        <div className="pd-page page">
            <div className="container">
                <Link to="/marketplace" className="pd-back"><ArrowLeft size={16} /> Back to Marketplace</Link>

                {/* Image Gallery or Placeholder */}
                <div className="pd-hero animate-fade-in">
                    {hasImages ? (
                        <div className="pd-gallery">
                            <div className="pd-gallery-main">
                                <img src={`${API_BASE}${property.images[activeImage]}`} alt={`${property.title} ${activeImage + 1}`} />
                                {property.images.length > 1 && (
                                    <>
                                        <button className="pd-gallery-nav prev" onClick={prevImage}><ChevronLeft size={20} /></button>
                                        <button className="pd-gallery-nav next" onClick={nextImage}><ChevronRight size={20} /></button>
                                        <div className="pd-gallery-counter">
                                            <Camera size={14} /> {activeImage + 1} / {property.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                            {property.images.length > 1 && (
                                <div className="pd-gallery-thumbs">
                                    {property.images.map((img, i) => (
                                        <button
                                            key={i}
                                            className={`pd-thumb ${i === activeImage ? 'active' : ''}`}
                                            onClick={() => setActiveImage(i)}
                                        >
                                            <img src={`${API_BASE}${img}`} alt={`thumb ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pd-image-placeholder">
                            <Building2 size={64} />
                        </div>
                    )}
                </div>

                <div className="pd-grid">
                    <div className="pd-main animate-fade-in">
                        <div className="pd-badges">
                            <span className={`badge ${property.type === 'buy' ? 'badge-primary' : 'badge-success'}`}>
                                {property.type === 'buy' ? 'For Sale' : 'For Rent'}
                            </span>
                            <span className="badge badge-warning">{property.propertyType}</span>
                            {property.featured && <span className="badge badge-danger">Featured</span>}
                        </div>

                        <h1 className="pd-title">{property.title}</h1>
                        <p className="pd-location"><MapPin size={16} /> {property.location.address}, {property.location.city}, {property.location.state} {property.location.zipCode}</p>
                        <div className="pd-price">{formatINR(property.price, property.type)}</div>

                        <div className="pd-meta-grid">
                            {property.bedrooms > 0 && (
                                <div className="pd-meta-item"><BedDouble size={20} /><span>{property.bedrooms}</span><label>Bedrooms</label></div>
                            )}
                            {property.bathrooms > 0 && (
                                <div className="pd-meta-item"><Bath size={20} /><span>{property.bathrooms}</span><label>Bathrooms</label></div>
                            )}
                            <div className="pd-meta-item"><Maximize size={20} /><span>{property.area.toLocaleString()}</span><label>Sq Ft</label></div>
                        </div>

                        <div className="pd-section">
                            <h3>Description</h3>
                            <p>{property.description}</p>
                        </div>

                        {property.amenities?.length > 0 && (
                            <div className="pd-section">
                                <h3>Amenities</h3>
                                <div className="pd-amenities">
                                    {property.amenities.map((a, i) => (
                                        <span key={i} className="pd-amenity">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pd-sidebar animate-fade-in">
                        <div className="card pd-contact-card">
                            <h3>Contact Owner</h3>
                            {property.owner && (
                                <>
                                    <div className="pd-owner">
                                        <div className="user-avatar">{property.owner.firstName?.[0]}{property.owner.lastName?.[0]}</div>
                                        <div>
                                            <div className="pd-owner-name">{property.owner.firstName} {property.owner.lastName}</div>
                                            <div className="pd-owner-user">@{property.owner.username}</div>
                                        </div>
                                    </div>
                                    {property.owner.email && <p className="pd-contact-info"><Mail size={14} /> {property.owner.email}</p>}
                                    {property.owner.phone && <p className="pd-contact-info"><Phone size={14} /> {property.owner.phone}</p>}
                                </>
                            )}
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '16px' }}
                                onClick={() => setShowInquiry(true)}
                            >
                                <MessageCircle size={16} /> Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Inquiry Modal ===== */}
            {showInquiry && (
                <div className="inquiry-overlay" onClick={() => setShowInquiry(false)}>
                    <div className="inquiry-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <button className="inquiry-close" onClick={() => setShowInquiry(false)}>
                            <X size={20} />
                        </button>

                        {inquirySent ? (
                            <div className="inquiry-success">
                                <div className="inquiry-success-icon"><CheckCircle size={48} /></div>
                                <h3>Inquiry Sent! 🎉</h3>
                                <p>Your message has been sent to the property owner. They'll get back to you soon.</p>
                                <button className="btn btn-primary" onClick={() => { setShowInquiry(false); setInquirySent(false); }}>
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="inquiry-header">
                                    <MessageCircle size={20} className="inquiry-header-icon" />
                                    <div>
                                        <h3>Send Inquiry</h3>
                                        <p>About: <strong>{property.title}</strong></p>
                                    </div>
                                </div>

                                <form className="inquiry-form" onSubmit={handleSendInquiry}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Your Name</label>
                                            <input
                                                className="form-input"
                                                placeholder="Rahul Sharma"
                                                value={inquiryForm.name}
                                                onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value.replace(/[0-9]/g, '') })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input
                                                className="form-input"
                                                placeholder="+91 98765 43210"
                                                value={inquiryForm.phone}
                                                onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="rahul@example.com"
                                            value={inquiryForm.email}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Message</label>
                                        <textarea
                                            className="form-input"
                                            rows={4}
                                            placeholder="I'm interested in this property..."
                                            value={inquiryForm.message}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sendingInquiry}>
                                        <Send size={16} /> {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
