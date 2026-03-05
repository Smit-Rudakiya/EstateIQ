const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

// @route   GET /api/properties
// @desc    Get all properties with search & filter
router.get('/', async (req, res) => {
    try {
        const { search, type, propertyType, minPrice, maxPrice, city, bedrooms, sort, page = 1, limit = 12 } = req.query;

        let query = { status: 'active' };

        // Type filter (buy/rent)
        if (type) query.type = type;

        // Property type filter
        if (propertyType) query.propertyType = propertyType;

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // City filter
        if (city) query['location.city'] = new RegExp(city, 'i');

        // Bedrooms filter
        if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const total = await Property.countDocuments(query);
        const properties = await Property.find(query)
            .populate('owner', 'firstName lastName username')
            .sort(sortOption)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            properties,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/properties/my/listings
// @desc    Get logged-in user's properties
router.get('/my/listings', auth, async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id })
            .sort({ createdAt: -1 });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/properties/:id
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'firstName lastName username email phone');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/properties
// @desc    Create property with optional images and amenities
router.post('/', auth, imageUpload.array('images', 10), async (req, res) => {
    try {
        const body = { ...req.body };

        // Parse location if sent as JSON string
        if (typeof body.location === 'string') {
            body.location = JSON.parse(body.location);
        }

        // Parse amenities if sent as JSON string
        if (typeof body.amenities === 'string') {
            try { body.amenities = JSON.parse(body.amenities); }
            catch { body.amenities = body.amenities.split(',').map(a => a.trim()).filter(Boolean); }
        }

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            body.images = req.files.map(f => `/uploads/${f.filename}`);
        }

        const property = await Property.create({
            ...body,
            owner: req.user._id
        });
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/properties/:id/images
// @desc    Upload images for a property
router.post('/:id/images', auth, imageUpload.array('images', 10), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const imageUrls = req.files.map(f => `/uploads/${f.filename}`);
        property.images.push(...imageUrls);
        await property.save();

        res.json({ images: property.images });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/properties/:id/images
// @desc    Remove an image from a property
router.delete('/:id/images', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { imageUrl } = req.body;
        property.images = property.images.filter(img => img !== imageUrl);
        await property.save();

        // Delete file from disk
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ images: property.images });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/properties/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/properties/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
