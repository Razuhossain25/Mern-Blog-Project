const ContactMessage = require('../model/contactMessage');

const isValidEmail = (value) => {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const createContactMessage = async (req, res) => {
    try {
        const body = req.body || {};
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const message = typeof body.message === 'string' ? body.message.trim() : '';

        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!email) return res.status(400).json({ error: 'Email is required' });
        if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const created = await ContactMessage.create({ name, email, message });
        return res.status(201).json({ success: true, message: 'Message sent successfully', data: created });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params || {};
        if (!id) return res.status(400).json({ error: 'Message id is required' });

        const deleted = await ContactMessage.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Message not found' });

        return res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContactMessage,
    getAllContactMessages,
    deleteContactMessage,
};
