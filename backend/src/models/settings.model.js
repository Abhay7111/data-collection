const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: 'global'
    },
    posVendors: {
        type: [String],
        default: ['Verifone', 'Ingenico', 'pax']
    },
    workflowStatuses: {
        type: [String],
        default: ['verified & operational']
    },
    roleColors: {
        admin: {
            primary: { type: String, default: '#CBF1F5' },
            secondary: { type: String, default: '#CBF1F5' }
        },
        manager: {
            primary: { type: String, default: '#F9F7F7' },
            secondary: { type: String, default: '#DBE2EF' }
        },
        user: {
            primary: { type: String, default: '#FFF5E4' },
            secondary: { type: String, default: '#FFE3E1' }
        }
    }
}, { timestamps: true })

module.exports = mongoose.model('AppSettings', settingsSchema)
