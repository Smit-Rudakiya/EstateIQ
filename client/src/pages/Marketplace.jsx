import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, BedDouble, Bath, Maximize, Filter, Camera } from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/formatINR';
import './Marketplace.css';

const API_BASE = 'http://localhost:5000';

const Marketplace = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ city: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '', sort: 'newest' });
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab) params.append('type', activeTab);
            if (search) params.append('search', search);
            if (filters.city) params.append('city', filters.city);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
            if (filters.sort) params.append('sort', filters.sort);
            params.append('page', page);

            const res = await api.get(`/properties?${params.toString()}`);
            setProperties(res.data.properties);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProperties(); }, [activeTab, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProperties();
    };

    const applyFilters = () => {
        setPage(1);
        fetchProperties();
        setShowFilters(false);
    };


    return (
        <div className="marketplace-page page">
            <div className="container">
                {/* Header */}
                <div className="mp-header animate-fade-in">
                    <div className="section-label">Marketplace</div>
                    <h1 className="section-title">Find Your Perfect Property</h1>
                    <p className="section-subtitle">Browse through our curated collection of properties with smart search and filters.</p>
                </div>

                {/* Tabs */}
                <div className="mp-tabs">
                    <button className={`mp-tab ${activeTab === '' ? 'active' : ''}`} onClick={() => { setActiveTab(''); setPage(1); }}>All</button>
                    <button className={`mp-tab ${activeTab === 'buy' ? 'active' : ''}`} onClick={() => { setActiveTab('buy'); setPage(1); }}>Buy</button>
                    <button className={`mp-tab ${activeTab === 'rent' ? 'active' : ''}`} onClick={() => { setActiveTab('rent'); setPage(1); }}>Rent</button>
                </div>

                {/* Search Bar */}
                <form className="mp-search" onSubmit={handleSearch}>
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search by title, location, or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">Search</button>
                </form>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mp-filters animate-fade-in">
                        <div className="filter-grid">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" placeholder="e.g. Miami" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Property Type</label>
                                <select className="form-input" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Price</label>
                                <input type="number" className="form-input" placeholder="$0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Price</label>
                                <input type="number" className="form-input" placeholder="No limit" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Bedrooms</label>
                                <select className="form-input" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
                                    <option value="">Any</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                    <option value="4">4+</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sort By</label>
                                <select className="form-input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ city: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '', sort: 'newest' }); setPage(1); fetchProperties(); }}>Clear</button>
                        </div>
                    </div>
                )}

                {/* Property Grid */}
                {loading ? (
                    <div className="mp-loading">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="property-card-skeleton"></div>)}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="mp-empty">
                        <h3>No properties found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="property-grid">
                            {properties.map(prop => (
                                <Link to={`/properties/${prop._id}`} key={prop._id} className="property-card animate-fade-in">
                                    <div className="property-image">
                                        {prop.images?.length > 0 ? (
                                            <img src={`${API_BASE}${prop.images[0]}`} alt={prop.title} className="property-image-photo" />
                                        ) : (
                                            <div className="property-image-placeholder">
                                                <MapPin size={32} />
                                            </div>
                                        )}
                                        <div className="property-badges">
                                            <span className={`badge ${prop.type === 'buy' ? 'badge-primary' : 'badge-success'}`}>
                                                {prop.type === 'buy' ? 'For Sale' : 'For Rent'}
                                            </span>
                                            {prop.featured && <span className="badge badge-warning">Featured</span>}
                                            {prop.images?.length > 1 && <span className="badge badge-primary"><Camera size={10} /> {prop.images.length}</span>}
                                        </div>
                                    </div>
                                    <div className="property-info">
                                        <div className="property-price">{formatINR(prop.price, prop.type)}</div>
                                        <h3 className="property-title">{prop.title}</h3>
                                        <p className="property-location"><MapPin size={14} /> {prop.location.city}, {prop.location.state}</p>
                                        <div className="property-meta">
                                            {prop.bedrooms > 0 && <span><BedDouble size={14} /> {prop.bedrooms} Beds</span>}
                                            {prop.bathrooms > 0 && <span><Bath size={14} /> {prop.bathrooms} Baths</span>}
                                            <span><Maximize size={14} /> {prop.area.toLocaleString()} sqft</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mp-pagination">
                                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                                <span className="pagination-info">Page {page} of {totalPages}</span>
                                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
