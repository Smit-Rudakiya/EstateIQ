const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @route   POST /api/documents/upload
router.post('/upload', auth, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const doc = await Document.create({
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.user._id,
            property: req.body.propertyId || undefined,
            status: 'uploaded'
        });

        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/documents
router.get('/', auth, async (req, res) => {
    try {
        const docs = await Document.find({ uploadedBy: req.user._id })
            .populate('property', 'title')
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/documents/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id })
            .populate('property', 'title');
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/documents/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from disk
        const fs = require('fs');
        if (fs.existsSync(doc.filePath)) {
            fs.unlinkSync(doc.filePath);
        }

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
