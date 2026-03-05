import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit, Trash2, MapPin, Eye, ImagePlus, X, Camera, Upload } from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatINR';
import toast from 'react-hot-toast';
import './MyListings.css';

const API_BASE = 'http://localhost:5000';

// Airbnb-style amenities list
const AMENITIES_LIST = [
    { label: 'Swimming Pool', icon: '🏊' },
    { label: 'Gym', icon: '💪' },
    { label: 'Parking', icon: '🅿️' },
    { label: 'Lift/Elevator', icon: '🛗' },
    { label: 'Power Backup', icon: '⚡' },
    { label: '24/7 Security', icon: '🔒' },
    { label: 'CCTV', icon: '📹' },
    { label: 'Club House', icon: '🏛️' },
    { label: 'Garden', icon: '🌳' },
    { label: 'Children Play Area', icon: '🎠' },
    { label: 'Balcony', icon: '🏠' },
    { label: 'Modular Kitchen', icon: '🍳' },
    { label: 'Wi-Fi', icon: '📶' },
    { label: 'AC', icon: '❄️' },
    { label: 'Furnished', icon: '🛋️' },
    { label: 'Semi-Furnished', icon: '🪑' },
    { label: 'Pet Friendly', icon: '🐾' },
    { label: 'Rooftop', icon: '🏗️' },
    { label: 'Intercom', icon: '📞' },
    { label: 'Fire Safety', icon: '🧯' },
    { label: 'Rainwater Harvesting', icon: '💧' },
    { label: 'Vastu Compliant', icon: '🧭' },
    { label: 'Near Metro', icon: '🚇' },
    { label: 'Near School', icon: '🏫' },
    { label: 'Near Hospital', icon: '🏥' },
    { label: 'Gated Community', icon: '🏘️' },
    { label: 'Servant Quarters', icon: '🏠' },
    { label: 'Study Room', icon: '📚' },
    { label: 'Piped Gas', icon: '🔥' },
    { label: 'Joggers Track', icon: '🏃' },
];

const MyListings = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(null);
    const [selectedPhotos, setSelectedPhotos] = useState([]);  // File objects for new listing
    const [photoPreviews, setPhotoPreviews] = useState([]);    // Preview URLs
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', type: 'buy', price: '', propertyType: 'apartment',
        bedrooms: '', bathrooms: '', area: '',
        address: '', city: '', state: '', zipCode: ''
    });

    const fetchProperties = async () => {
        try {
            const res = await api.get('/properties/my/listings');
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProperties(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const toggleAmenity = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newPhotos = [...selectedPhotos, ...files].slice(0, 10);
        setSelectedPhotos(newPhotos);
        // Generate preview URLs
        const previews = newPhotos.map(f => URL.createObjectURL(f));
        setPhotoPreviews(previews);
    };

    const removePhoto = (index) => {
        URL.revokeObjectURL(photoPreviews[index]);
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    const resetForm = () => {
        setForm({ title: '', description: '', type: 'buy', price: '', propertyType: 'apartment', bedrooms: '', bathrooms: '', area: '', address: '', city: '', state: '', zipCode: '' });
        setEditingId(null);
        setShowAdd(false);
        setSelectedAmenities([]);
        photoPreviews.forEach(url => URL.revokeObjectURL(url));
        setSelectedPhotos([]);
        setPhotoPreviews([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId) {
                // Update uses JSON (images are managed separately for existing properties)
                const payload = {
                    title: form.title, description: form.description, type: form.type,
                    price: Number(form.price), propertyType: form.propertyType,
                    bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
                    area: Number(form.area),
                    location: { address: form.address, city: form.city, state: form.state, zipCode: form.zipCode },
                    amenities: selectedAmenities
                };
                await api.put(`/properties/${editingId}`, payload);
                toast.success('Property updated!');
            } else {
                // Create uses FormData (supports images)
                const fd = new FormData();
                fd.append('title', form.title);
                fd.append('description', form.description);
                fd.append('type', form.type);
                fd.append('price', form.price);
                fd.append('propertyType', form.propertyType);
                fd.append('bedrooms', form.bedrooms || '0');
                fd.append('bathrooms', form.bathrooms || '0');
                fd.append('area', form.area);
                fd.append('location', JSON.stringify({ address: form.address, city: form.city, state: form.state, zipCode: form.zipCode }));
                fd.append('amenities', JSON.stringify(selectedAmenities));
                selectedPhotos.forEach(f => fd.append('images', f));

                await api.post('/properties', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Property listed successfully!');
            }
            resetForm();
            fetchProperties();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save property');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (prop) => {
        setForm({
            title: prop.title, description: prop.description, type: prop.type, price: prop.price,
            propertyType: prop.propertyType, bedrooms: prop.bedrooms, bathrooms: prop.bathrooms, area: prop.area,
            address: prop.location.address, city: prop.location.city, state: prop.location.state, zipCode: prop.location.zipCode || ''
        });
        setSelectedAmenities(prop.amenities || []);
        setEditingId(prop._id);
        setShowAdd(true);
        // Clear any file previews
        setSelectedPhotos([]);
        setPhotoPreviews([]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await api.delete(`/properties/${id}`);
            toast.success('Property deleted');
            fetchProperties();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleImageUpload = async (e, propertyId) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const formData = new FormData();
        files.forEach(f => formData.append('images', f));
        setUploadingImages(propertyId);
        try {
            await api.post(`/properties/${propertyId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`);
            fetchProperties();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload images');
        } finally {
            setUploadingImages(null);
        }
    };

    const handleDeleteImage = async (propertyId, imageUrl) => {
        try {
            await api.delete(`/properties/${propertyId}/images`, { data: { imageUrl } });
            toast.success('Photo removed');
            fetchProperties();
        } catch (err) {
            toast.error('Failed to remove photo');
        }
    };

    return (
        <div className="mylistings-page page">
            <div className="container">
                <div className="ml-header animate-fade-in">
                    <div>
                        <h1>My Listings</h1>
                        <p>{properties.length} {properties.length === 1 ? 'property' : 'properties'} listed</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); if (showAdd) resetForm(); }}>
                        <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Property'}
                    </button>
                </div>

                {/* ===== Add/Edit Form ===== */}
                {showAdd && (
                    <form className="ml-form card animate-fade-in" onSubmit={handleSubmit}>
                        <h3>{editingId ? '✏️ Edit Property' : '🏠 List New Property'}</h3>

                        {/* Basic Info */}
                        <div className="form-section-label">Basic Information</div>
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input name="title" className="form-input" placeholder="e.g. Luxury 3 BHK in Bandra" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" placeholder="Describe your property — highlights, condition, surroundings..." rows={3} value={form.description} onChange={handleChange} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Listing Type</label>
                                <select name="type" className="form-input" value={form.type} onChange={handleChange}>
                                    <option value="buy">For Sale</option>
                                    <option value="rent">For Rent</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Property Type</label>
                                <select name="propertyType" className="form-input" value={form.propertyType} onChange={handleChange}>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="form-section-label">Details & Pricing</div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price (₹)</label>
                                <input name="price" type="number" className="form-input" placeholder="4500000" value={form.price} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area (sqft)</label>
                                <input name="area" type="number" className="form-input" placeholder="2000" value={form.area} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Bedrooms</label>
                                <input name="bedrooms" type="number" className="form-input" placeholder="3" value={form.bedrooms} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bathrooms</label>
                                <input name="bathrooms" type="number" className="form-input" placeholder="2" value={form.bathrooms} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="form-section-label">Location</div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input name="address" className="form-input" placeholder="e.g. MG Road, Sector 5" value={form.address} onChange={handleChange} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input name="city" className="form-input" placeholder="Mumbai" value={form.city} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input name="state" className="form-input" placeholder="Maharashtra" value={form.state} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">PIN Code</label>
                                <input name="zipCode" className="form-input" placeholder="400001" value={form.zipCode} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="form-section-label">
                            {editingId ? 'Add More Photos (use Photos button on card)' : `Photos ${selectedPhotos.length > 0 ? `(${selectedPhotos.length}/10)` : ''}`}
                        </div>
                        {!editingId && (
                            <div className="photo-upload-area">
                                {photoPreviews.length > 0 && (
                                    <div className="photo-previews">
                                        {photoPreviews.map((url, i) => (
                                            <div key={i} className="photo-preview-item">
                                                <img src={url} alt={`Preview ${i + 1}`} />
                                                <button type="button" className="photo-preview-remove" onClick={() => removePhoto(i)}>
                                                    <X size={12} />
                                                </button>
                                                {i === 0 && <span className="photo-cover-badge">Cover</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPhotos.length < 10 && (
                                    <label className="photo-upload-trigger">
                                        <Upload size={20} />
                                        <span>Click to add photos</span>
                                        <span className="photo-upload-hint">JPG, PNG, WEBP — Max 5MB each, up to 10 photos</span>
                                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelect} hidden />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Amenities */}
                        <div className="form-section-label">Amenities <span className="amenity-count">{selectedAmenities.length} selected</span></div>
                        <div className="amenities-grid">
                            {AMENITIES_LIST.map(({ label, icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={`amenity-chip ${selectedAmenities.includes(label) ? 'active' : ''}`}
                                    onClick={() => toggleAmenity(label)}
                                >
                                    <span className="amenity-chip-icon">{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : editingId ? 'Update Property' : 'List Property'}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                )}

                {/* ===== Listings ===== */}
                {loading ? (
                    <div className="dash-loading">Loading...</div>
                ) : properties.length === 0 ? (
                    <div className="ml-empty card">
                        <Building2 size={48} />
                        <h3>No properties yet</h3>
                        <p>Click "Add Property" to list your first property</p>
                    </div>
                ) : (
                    <div className="ml-list">
                        {properties.map(prop => (
                            <div key={prop._id} className="ml-card card">
                                {/* Property Images */}
                                {prop.images?.length > 0 && (
                                    <div className="ml-card-images">
                                        {prop.images.map((img, i) => (
                                            <div key={i} className="ml-card-image-wrapper">
                                                <img src={`${API_BASE}${img}`} alt={`${prop.title} ${i + 1}`} />
                                                <button className="ml-img-remove" onClick={() => handleDeleteImage(prop._id, img)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="ml-card-body">
                                    <div className="ml-card-info">
                                        <div className="ml-card-badges">
                                            <span className={`badge ${prop.type === 'buy' ? 'badge-primary' : 'badge-success'}`}>
                                                {prop.type === 'buy' ? 'For Sale' : 'For Rent'}
                                            </span>
                                            <span className="badge badge-warning">{prop.propertyType}</span>
                                            {prop.images?.length > 0 && (
                                                <span className="badge badge-primary"><Camera size={10} /> {prop.images.length} photo{prop.images.length > 1 ? 's' : ''}</span>
                                            )}
                                        </div>
                                        <h3>{prop.title}</h3>
                                        <p className="ml-card-location"><MapPin size={14} /> {prop.location.city}, {prop.location.state}</p>
                                        <p className="ml-card-price">{formatINR(prop.price, prop.type)}</p>
                                        {prop.amenities?.length > 0 && (
                                            <div className="ml-card-amenities">
                                                {prop.amenities.slice(0, 4).map((a, i) => (
                                                    <span key={i} className="mini-amenity">{a}</span>
                                                ))}
                                                {prop.amenities.length > 4 && <span className="mini-amenity mini-amenity-more">+{prop.amenities.length - 4}</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-card-actions">
                                        <label className={`btn btn-ghost btn-sm ml-upload-btn ${uploadingImages === prop._id ? 'uploading' : ''}`}>
                                            <ImagePlus size={14} /> {uploadingImages === prop._id ? 'Uploading...' : 'Photos'}
                                            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => handleImageUpload(e, prop._id)} hidden disabled={uploadingImages === prop._id} />
                                        </label>
                                        <Link to={`/properties/${prop._id}`} className="btn btn-ghost btn-sm"><Eye size={14} /> View</Link>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(prop)}><Edit size={14} /> Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prop._id)}><Trash2 size={14} /> Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyListings;
