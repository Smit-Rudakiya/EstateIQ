const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    type: {
        type: String,
        enum: ['buy', 'rent'],
        required: [true, 'Property type is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String }
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'commercial', 'land', 'office'],
        default: 'apartment'
    },
    bedrooms: {
        type: Number,
        default: 0
    },
    bathrooms: {
        type: Number,
        default: 0
    },
    area: {
        type: Number,
        required: true
    },
    amenities: [String],
    images: [String],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'sold', 'rented'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Text index for search
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text', 'location.address': 'text' });

module.exports = mongoose.model('Property', propertySchema);
