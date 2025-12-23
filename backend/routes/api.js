const express = require('express');
const { getAllPost, addPost } = require('../controllers/blogController');
const uploadSingleImage = require('../middleware/uploadSingleImage');
const router = express.Router();

router.get('/posts', getAllPost);
router.post('/add-post', uploadSingleImage, addPost);

module.exports = router;