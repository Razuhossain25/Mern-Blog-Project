const express = require('express');
const { getAllPost, addPost, getSinglePost, updatePost, deletePost } = require('../controllers/blogController');
const uploadSingleImage = require('../middleware/uploadSingleImage');
const uploadSettingsImages = require('../middleware/uploadSettingsImages');
const { login, checkAuth } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { updateProfile } = require('../controllers/profileController');
const { createContactMessage, getAllContactMessages, deleteContactMessage } = require('../controllers/contactController');
const { createComment, getCommentsByPost, getAllComments, approveComment, deleteComment } = require('../controllers/commentController');
const router = express.Router();

// Only run multer when the request is multipart/form-data (i.e., when uploading a file)
const maybeUploadSingleImage = (req, res, next) => {
	const contentType = req.headers['content-type'] || '';
	if (contentType.includes('multipart/form-data')) {
		return uploadSingleImage(req, res, next);
	}
	return next();
};

router.get('/posts', getAllPost);
router.get('/posts/:id', getSinglePost);
router.post('/add-post', uploadSingleImage, addPost);
router.put('/posts/:id', maybeUploadSingleImage, updatePost);
router.delete('/posts/:id', deletePost);

router.post('/login', login);
router.get('/check-auth', checkAuth);

// Settings
router.get('/settings', getSettings);

// Only run multer when multipart/form-data (logo/favicon upload)
const maybeUploadSettingsImages = (req, res, next) => {
	const contentType = req.headers['content-type'] || '';
	if (contentType.includes('multipart/form-data')) {
		return uploadSettingsImages(req, res, next);
	}
	return next();
};

router.put('/settings', requireAuth, maybeUploadSettingsImages, updateSettings);

// Profile
router.put('/profile', requireAuth, updateProfile);

// Contact Messages
router.post('/contact', createContactMessage);
router.get('/contact-messages', requireAuth, getAllContactMessages);
router.delete('/contact-messages/:id', requireAuth, deleteContactMessage);

// Blog Comments (anonymous)
router.get('/posts/:id/comments', getCommentsByPost);
router.post('/posts/:id/comments', createComment);

// Admin Comment Management
router.get('/comments', requireAuth, getAllComments);
router.put('/comments/:id/approve', requireAuth, approveComment);
router.delete('/comments/:id', requireAuth, deleteComment);

module.exports = router;