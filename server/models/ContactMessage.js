const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'resolved'],
        default: 'new'
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    phone: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
