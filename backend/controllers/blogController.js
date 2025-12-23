const blog = require("../model/blog");

const getAllPost = async (req, res) => {
    try {
        const posts = await blog.find({});
        return res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const addPost = async (req, res) => {
    const { title = '', content = '', author = '' } = req.body || {};
    if(!title || !content || !author) {
        return res.status(400).json({ error: 'All fields are required', data: req.body });
    }
    if(!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }
    try {
        const featuredImage = req.fileName || '';
        const newPost = new blog({ title, content, author, featuredImage });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllPost,
    addPost
};