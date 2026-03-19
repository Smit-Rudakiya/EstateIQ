const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
            'property_updated', 'property_deleted', 'property_status_changed',
            'document_deleted',
            'contact_resolved', 'contact_deleted',
            'admin_login'
        ]
    },
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['user', 'property', 'document', 'contact', 'system']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
