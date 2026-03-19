const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Property = require('../models/Property');
const Document = require('../models/Document');
const ContactMessage = require('../models/ContactMessage');
const AuditLog = require('../models/AuditLog');
const { sendContactResolvedEmail } = require('../utils/mailService');

// Helper to create audit log
const logAction = async (adminId, action, targetType, targetId, details, metadata) => {
    try {
        await AuditLog.create({ action, adminUser: adminId, targetType, targetId, details, metadata });
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

// ===================== DASHBOARD STATS =====================

// @route   GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [totalUsers, totalProperties, totalDocuments, totalContacts, recentUsers, recentProperties] = await Promise.all([
            User.countDocuments(),
            Property.countDocuments(),
            Document.countDocuments(),
            ContactMessage.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName username email role createdAt'),
            Property.find().sort({ createdAt: -1 }).limit(5).select('title type price status createdAt').populate('owner', 'firstName lastName')
        ]);

        // Counts from last 30 days for percentage change
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [newUsers30d, newProperties30d, newDocuments30d, newContacts30d] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Property.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Document.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            ContactMessage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        // Recent audit logs
        const recentActivity = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('adminUser', 'firstName lastName');

        res.json({
            stats: {
                totalUsers,
                totalProperties,
                totalDocuments,
                totalContacts,
                newUsers30d,
                newProperties30d,
                newDocuments30d,
                newContacts30d
            },
            recentUsers,
            recentProperties,
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== USER MANAGEMENT =====================

// @route   GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { username: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/users/:id
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/users/:id
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const oldRole = user.role;
        if (role && ['user', 'admin'].includes(role)) {
            user.role = role;
            await user.save();
            await logAction(req.user._id, 'user_role_changed', 'user', user._id,
                `Changed role from ${oldRole} to ${role} for ${user.username}`);
        }

        res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await logAction(req.user._id, 'user_deleted', 'user', user._id,
            `Deleted user: ${user.username} (${user.email})`);

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/users/bulk-delete
router.post('/users/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        // Filter out self to prevent accidental suicide
        const filteredIds = ids.filter(id => id !== req.user._id.toString());
        
        const result = await User.deleteMany({ _id: { $in: filteredIds } });
        await logAction(req.user._id, 'bulk_users_deleted', 'user', null, 
            `Bulk deleted ${result.deletedCount} users`);

        res.json({ message: `Deleted ${result.deletedCount} users`, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== PROPERTY MANAGEMENT =====================

// @route   GET /api/admin/properties
router.get('/properties', adminAuth, async (req, res) => {
    try {
        const { search, status, type, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { 'location.city': new RegExp(search, 'i') },
                { 'location.address': new RegExp(search, 'i') }
            ];
        }

        const total = await Property.countDocuments(query);
        const properties = await Property.find(query)
            .populate('owner', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/properties/:id
router.put('/properties/:id', adminAuth, async (req, res) => {
    try {
        const { status, featured } = req.body;
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const oldStatus = property.status;
        if (status) property.status = status;
        if (typeof featured === 'boolean') property.featured = featured;
        await property.save();

        await logAction(req.user._id, 'property_status_changed', 'property', property._id,
            `Changed property "${property.title}" status from ${oldStatus} to ${status || oldStatus}`);

        res.json({ message: 'Property updated', property });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/properties/:id
router.delete('/properties/:id', adminAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        await logAction(req.user._id, 'property_deleted', 'property', property._id,
            `Deleted property: ${property.title}`);

        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/properties/bulk-delete
router.post('/properties/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        const result = await Property.deleteMany({ _id: { $in: ids } });
        await logAction(req.user._id, 'bulk_properties_deleted', 'property', null, 
            `Bulk deleted ${result.deletedCount} properties`);

        res.json({ message: `Deleted ${result.deletedCount} properties`, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== CONTACT MANAGEMENT =====================

// @route   GET /api/admin/contacts
router.get('/contacts', adminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;

        const total = await ContactMessage.countDocuments(query);
        const contacts = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/contacts/:id
router.put('/contacts/:id', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await ContactMessage.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        contact.status = status || 'resolved';
        await contact.save();

        await logAction(req.user._id, 'contact_resolved', 'contact', contact._id,
            `Resolved contact from ${contact.name} (${contact.email})`);

        // Send email (non-blocking)
        sendContactResolvedEmail(contact).catch(err => console.error('Email error:', err));

        res.json({ message: 'Contact updated', contact });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/contacts/bulk-delete
router.post('/contacts/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        const result = await ContactMessage.deleteMany({ _id: { $in: ids } });
        await logAction(req.user._id, 'bulk_contacts_deleted', 'contact', null, 
            `Bulk deleted ${result.deletedCount} contact messages`);

        res.json({ message: `Deleted ${result.deletedCount} messages`, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/contacts/:id
router.delete('/contacts/:id', adminAuth, async (req, res) => {
    try {
        const contact = await ContactMessage.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        await logAction(req.user._id, 'contact_deleted', 'contact', contact._id,
            `Deleted contact from ${contact.name}`);

        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== DOCUMENT MANAGEMENT =====================

// @route   GET /api/admin/documents
router.get('/documents', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const total = await Document.countDocuments();
        const documents = await Document.find()
            .populate('uploadedBy', 'firstName lastName username')
            .populate('property', 'title')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ documents, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/documents/:id
router.delete('/documents/:id', adminAuth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Delete file from disk
        const fs = require('fs');
        if (fs.existsSync(doc.filePath)) {
            fs.unlinkSync(doc.filePath);
        }

        await logAction(req.user._id, 'document_deleted', 'document', doc._id,
            `Deleted document: ${doc.originalName}`);

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/admin/documents/bulk-delete
router.post('/documents/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

        const result = await Document.deleteMany({ _id: { $in: ids } });
        await logAction(req.user._id, 'bulk_documents_deleted', 'document', null, 
            `Bulk deleted ${result.deletedCount} documents`);

        res.json({ message: `Deleted ${result.deletedCount} documents`, count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===================== AUDIT LOGS =====================

// @route   GET /api/admin/audit-logs
router.get('/audit-logs', adminAuth, async (req, res) => {
    try {
        const { action, page = 1, limit = 30 } = req.query;
        let query = {};
        if (action) query.action = action;

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .populate('adminUser', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
