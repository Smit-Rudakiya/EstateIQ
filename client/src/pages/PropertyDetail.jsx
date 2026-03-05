import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Bath, Maximize, Building2, User, Mail, Phone, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatINR';
import './PropertyDetail.css';

const API_BASE = 'http://localhost:5000';

const PropertyDetail = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

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
                            <Link to="/contact" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Send Inquiry</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
