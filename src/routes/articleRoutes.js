const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/featured', articleController.getFeaturedArticles);
router.get('/stats', articleController.getArticleStats);
router.get('/category/:categorySlug', articleController.getArticlesByCategory);
router.get('/:slug', articleController.getArticleBySlug);

// Protected routes
router.post('/', protect, upload.single('image'), articleController.createArticle);
router.put('/:id', protect, upload.single('image'), articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

// Admin only routes
router.patch('/:id/featured', protect, authorize('admin'), articleController.toggleFeatured);

module.exports = router;