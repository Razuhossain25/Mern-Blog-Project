const blog = require("../model/blog");
const fs = require('fs');
const path = require('path');

const safeUnlink = async (absoluteFilePath) => {
    if (!absoluteFilePath) return;
    try {
        await fs.promises.unlink(absoluteFilePath);
    } catch (err) {
        // ignore missing files
        if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) return;
        throw err;
    }
};

const uploadsPathFor = (fileName) => {
    if (!fileName) return '';
    return path.join(__dirname, '..', 'public', 'uploads', fileName);
};

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

const getSinglePost = async (req, res) => {
    const { id } = req.params || {};
    try {
        const post = await blog.findById(id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params || {};
    const { title, content, author } = req.body || {};

    try {
        const post = await blog.findById(id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const hasNewImage = !!req.file;
        const newFeaturedImage = hasNewImage ? (req.fileName || '') : '';

        if (typeof title === 'string' && title.trim() !== '') post.title = title;
        if (typeof content === 'string' && content.trim() !== '') post.content = content;
        if (typeof author === 'string' && author.trim() !== '') post.author = author;

        if (hasNewImage) {
            const previousImage = post.featuredImage;
            // Only delete previous image if we are actually replacing it.
            if (previousImage && previousImage !== newFeaturedImage) {
                await safeUnlink(uploadsPathFor(previousImage));
            }
            post.featuredImage = newFeaturedImage;
        }

        const updated = await post.save();
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params || {};
    try {
        const post = await blog.findById(id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const previousImage = post.featuredImage;
        if (previousImage) {
            await safeUnlink(uploadsPathFor(previousImage));
        }

        await post.deleteOne();
        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPost,
    addPost,
    getSinglePost,
    updatePost,
    deletePost,
};