const { Article, User, Category } = require('../models');
const slugify = require('../utils/slugify');

// Get all articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single article
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Increment view count
    article.viewCount += 1;
    await article.save();
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new article
exports.createArticle = async (req, res) => {
  try {
    const { title, content, categoryId, published } = req.body;
    
    // Create slug from title
    const slug = slugify(title);
    
    // Get image filename if uploaded
    const image = req.file ? req.file.filename : null;
    
    // Set published date if article is published
    const publishedAt = published ? new Date() : null;
    
    const article = await Article.create({
      title,
      slug,
      content,
      image,
      categoryId,
      authorId: req.user.id,
      published,
      publishedAt
    });
    
    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    let article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Check if user is author or admin
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }
    
    const { title, content, categoryId, published } = req.body;
    
    // Update slug if title changed
    const slug = title !== article.title ? slugify(title) : article.slug;
    
    // Get image filename if new image uploaded
    const image = req.file ? req.file.filename : article.image;
    
    // Set published date if article is being published for the first time
    const publishedAt = !article.published && published ? new Date() : article.publishedAt;
    
    await article.update({
      title: title || article.title,
      slug,
      content: content || article.content,
      image,
      categoryId: categoryId || article.categoryId,
      published: published !== undefined ? published : article.published,
      publishedAt
    });
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Check if user is author or admin
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }
    
    await article.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};