const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/:slug', articleController.getArticleBySlug);

// Protected routes
router.post('/', protect, upload.single('image'), articleController.createArticle);
router.put('/:id', protect, upload.single('image'), articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;