const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

// @route   POST /api/inquiries
// @desc    Send an inquiry for a property (public or logged-in user)
router.post('/', [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { propertyId, name, email, phone, message } = req.body;

        // Find the property and its owner
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Determine sender (if logged in via optional auth)
        let senderId = null;
        try {
            const jwt = require('jsonwebtoken');
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                senderId = decoded.id;
            }
        } catch (e) {
            // Not logged in or invalid token — that's fine
        }

        const inquiry = await Inquiry.create({
            property: propertyId,
            owner: property.owner,
            sender: senderId,
            name,
            email,
            phone: phone || undefined,
            message
        });

        res.status(201).json({ message: 'Inquiry sent successfully!', inquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/inquiries/received
// @desc    Get all inquiries received for the logged-in user's properties
router.get('/received', auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = { owner: req.user._id };
        if (status) query.status = status;

        const total = await Inquiry.countDocuments(query);
        const inquiries = await Inquiry.find(query)
            .populate('property', 'title location type price')
            .populate('sender', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        // Count new (unread) inquiries
        const newCount = await Inquiry.countDocuments({ owner: req.user._id, status: 'new' });

        res.json({ inquiries, total, newCount, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/inquiries/:id/status
// @desc    Owner updates inquiry status (read/responded)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        // Only the owner can update
        if (inquiry.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        inquiry.status = status;
        await inquiry.save();

        res.json({ message: 'Inquiry updated', inquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/inquiries/:id/respond
// @desc    Owner sends a text response to an inquiry
router.put('/:id/respond', auth, async (req, res) => {
    try {
        const { response } = req.body;
        if (!response || !response.trim()) {
            return res.status(400).json({ message: 'Response message is required' });
        }

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        if (inquiry.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        inquiry.response = response.trim();
        inquiry.respondedAt = new Date();
        inquiry.status = 'responded';
        await inquiry.save();

        res.json({ message: 'Response sent successfully', inquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== ADMIN ROUTES =====================

// @route   GET /api/inquiries/admin/all
// @desc    Admin gets all inquiries across the platform
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;

        const total = await Inquiry.countDocuments(query);
        const inquiries = await Inquiry.find(query)
            .populate('property', 'title location')
            .populate('owner', 'firstName lastName username')
            .populate('sender', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ inquiries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/inquiries/admin/:id
// @desc    Admin deletes an inquiry
router.delete('/admin/:id', adminAuth, async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        await Inquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/inquiries/admin/bulk-delete
// @desc    Admin bulk deletes inquiries
router.post('/admin/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid IDs' });
        }
        const result = await Inquiry.deleteMany({ _id: { $in: ids } });
        res.json({ message: `Deleted ${result.deletedCount} inquiries`, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
