const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactMessageSchema = new Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: { type: String, required: [true, 'Email is required'], trim: true },
        message: { type: String, required: [true, 'Message is required'], trim: true },
    },
    { timestamps: true, collection: 'contact_messages' }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
