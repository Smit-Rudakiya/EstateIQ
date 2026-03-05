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
        enum: ['uploaded', 'pending'],
        default: 'uploaded'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
