const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    status: {
        type: String,
        enum: ['uploaded', 'analyzing', 'analyzed', 'failed', 'pending'],
        default: 'uploaded'
    },
    // NLP Analysis Results
    extractedText: {
        type: String,
        default: null
    },
    analysis: {
        summary: { type: String, default: null },
        entities: { type: mongoose.Schema.Types.Mixed, default: {} },
        alerts: [{ type: { type: String }, message: String }],
        clauses: [{ label: String, snippet: String }],
        wordCount: { type: Number, default: 0 },
        charCount: { type: Number, default: 0 }
    },
    analyzedAt: {
        type: Date,
        default: null
    },
    analysisError: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);

