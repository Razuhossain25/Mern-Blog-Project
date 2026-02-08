const Comment = require('../model/comment');
const Blog = require('../model/blog');

const isValidEmail = (value) => {
    if (!value) return true;
    const email = String(value).trim();
    if (!email) return true;
    // Simple email validation (good enough for basic UX).
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const createComment = async (req, res) => {
    const { id: postId } = req.params || {};
    const { name = '', email = '', message = '' } = req.body || {};

    if (!postId) return res.status(400).json({ error: 'Post id is required' });
    if (!String(name).trim() || !String(message).trim()) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please provide a valid email' });
    }

    try {
        const post = await Blog.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const created = await Comment.create({
            postId,
            name: String(name).trim(),
            email: String(email || '').trim(),
            message: String(message).trim(),
            approved: false,
        });

        return res.status(201).json(created);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCommentsByPost = async (req, res) => {
    const { id: postId } = req.params || {};
    if (!postId) return res.status(400).json({ error: 'Post id is required' });

    try {
        // Only show approved comments publicly.
        // Backward compatible: older docs without `approved` are treated as approved.
        const comments = await Comment.find({ postId, approved: { $ne: false } }).sort({ createdAt: -1 });
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const approveComment = async (req, res) => {
    try {
        const { id } = req.params || {};
        if (!id) return res.status(400).json({ error: 'Comment id is required' });

        const updated = await Comment.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true }
        ).populate('postId', 'title');

        if (!updated) return res.status(404).json({ error: 'Comment not found' });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find({})
            .sort({ createdAt: -1 })
            .populate('postId', 'title');
        return res.status(200).json(comments);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params || {};
        if (!id) return res.status(400).json({ error: 'Comment id is required' });

        const deleted = await Comment.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Comment not found' });

        return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createComment,
    getCommentsByPost,
    getAllComments,
    approveComment,
    deleteComment,
};
