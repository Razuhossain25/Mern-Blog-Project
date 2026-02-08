const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema(
    {
        websiteTitle: { type: String, default: 'MERN Blog' },
        themeColor: { type: String, default: '#2563eb' },
        logo: { type: String, default: '' },
        favicon: { type: String, default: '' },
        contact: {
            mobile: { type: String, default: '' },
            email: { type: String, default: '' },
            address: { type: String, default: '' },
        },
    },
    { timestamps: true, collection: 'settings' }
);

module.exports = mongoose.model('Settings', settingsSchema);
