const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * Forward a file to the Python NLP microservice for analysis.
 * Uses native fetch (Node 18+) with FormData.
 */
async function analyzeWithNLP(filePath, originalName) {
    const { FormData } = await import('formdata-node');
    const { fileFromPath } = await import('formdata-node/file-from-path');

    const form = new FormData();
    const file = await fileFromPath(filePath, originalName);
    form.append('file', file);

    const response = await fetch(`${NLP_SERVICE_URL}/analyze`, {
        method: 'POST',
        body: form,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `NLP service returned ${response.status}`);
    }
    return response.json();
}

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

        // Return immediately, process NLP in background
        res.status(201).json(doc);

        // --- Async NLP analysis (does not block the response) ---
        const isAnalyzable = req.file.mimetype === 'application/pdf' ||
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.originalname.toLowerCase().endsWith('.docx') ||
            req.file.originalname.toLowerCase().endsWith('.doc');

        if (isAnalyzable) {
            try {
                doc.status = 'analyzing';
                await doc.save();

                const result = await analyzeWithNLP(req.file.path, req.file.originalname);

                doc.extractedText = result.extractedText || '';
                doc.analysis = result.analysis || {};
                doc.status = 'analyzed';
                doc.analyzedAt = new Date();
                await doc.save();
            } catch (nlpErr) {
                console.error('NLP analysis failed:', nlpErr.message);
                doc.status = 'failed';
                doc.analysisError = nlpErr.message;
                await doc.save();
            }
        }
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
