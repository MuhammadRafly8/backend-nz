const { Article, User, Category } = require('../models');
const slugify = require('../utils/slugify');
const { getImageUrl } = require('../utils/imageUrl');
const { Op } = require('sequelize'); // Added Op import for OR queries

// Helper function to format article data with proper image URLs
const formatArticleData = (article) => {
  if (!article) return null;
  
  const articleData = article.toJSON ? article.toJSON() : article;
  
  // Add proper image URL if image exists
  if (articleData.image) {
    articleData.imageUrl = getImageUrl(articleData.image);
  }
  
  return articleData;
};

// Helper function to format multiple articles
const formatArticlesData = (articles) => {
  if (Array.isArray(articles)) {
    return articles.map(formatArticleData);
  }
  return formatArticleData(articles);
};

// Get all articles with enhanced filtering
exports.getAllArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      department, 
      search, 
      published = true,
      featured = false 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    if (published !== 'false') {
      whereClause.published = true;
    }
    if (featured === 'true') {
      whereClause.featured = true;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build include clause
    const includeClause = [
      { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
    ];

    // Add category filter
    if (category) {
      includeClause[1].where = { slug: category };
    }

    const articles = await Article.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      count: articles.count,
      totalPages: Math.ceil(articles.count / limit),
      currentPage: parseInt(page),
      data: formatArticlesData(articles.rows)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get featured articles
exports.getFeaturedArticles = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const articles = await Article.findAll({
      where: { 
        published: true,
        featured: true 
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: formatArticlesData(articles)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get articles by category
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const articles = await Article.findAndCountAll({
      where: { published: true },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { 
          model: Category, 
          as: 'category', 
          attributes: ['id', 'name', 'slug'],
          where: { slug: categorySlug }
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: articles.count,
      totalPages: Math.ceil(articles.count / limit),
      currentPage: parseInt(page),
      data: formatArticlesData(articles.rows)
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
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
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
      data: formatArticleData(article)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new article with enhanced validation
exports.createArticle = async (req, res) => {
  try {
    const { title, content, categoryId, published, featured, department } = req.body;
    
    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    // Create slug from title
    const slug = slugify(title);
    
    // Check if slug already exists
    const existingArticle = await Article.findOne({ where: { slug } });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'An article with this title already exists'
      });
    }
    
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
      published: published || false,
      featured: featured || false,
      department: department || null,
      publishedAt
    });

    // Fetch the created article with relations
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: formatArticleData(createdArticle)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update article with enhanced validation
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
    
    const { title, content, categoryId, published, featured, department } = req.body;
    
    // Update slug if title changed
    let slug = article.slug;
    if (title && title !== article.title) {
      slug = slugify(title);
      
      // Check if new slug already exists
      const existingArticle = await Article.findOne({ 
        where: { slug, id: { [Op.ne]: article.id } }
      });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: 'An article with this title already exists'
        });
      }
    }
    
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
      featured: featured !== undefined ? featured : article.featured,
      department: department || article.department,
      publishedAt
    });

    // Fetch the updated article with relations
    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: formatArticleData(updatedArticle)
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

// Toggle article featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Only admin can toggle featured status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can toggle featured status'
      });
    }
    
    article.featured = !article.featured;
    await article.save();
    
    res.status(200).json({
      success: true,
      message: `Article ${article.featured ? 'marked as' : 'unmarked from'} featured`,
      data: { featured: article.featured }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get article statistics
exports.getArticleStats = async (req, res) => {
  try {
    const totalArticles = await Article.count();
    const publishedArticles = await Article.count({ where: { published: true } });
    const featuredArticles = await Article.count({ where: { featured: true } });
    const totalViews = await Article.sum('viewCount') || 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalArticles,
        publishedArticles,
        featuredArticles,
        totalViews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};