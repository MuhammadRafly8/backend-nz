const { Category, Article } = require('../models');
const slugify = require('../utils/slugify');
const { Op } = require('sequelize');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: ['id'],
          where: { published: true },
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Add article count to each category
    const categoriesWithCount = categories.map(category => {
      const categoryData = category.toJSON();
      categoryData.articleCount = categoryData.articles ? categoryData.articles.length : 0;
      delete categoryData.articles; // Remove articles array, keep only count
      return categoryData;
    });

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Article,
          as: 'articles',
          where: { published: true },
          required: false,
          order: [['publishedAt', 'DESC']]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const slug = slugify(name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || null
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description } = req.body;

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name);

      // Check if new slug already exists
      const existingCategory = await Category.findOne({ 
        where: { slug, id: { [Op.ne]: category.id } }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists'
        });
      }
    }

    await category.update({
      name: name || category.name,
      slug,
      description: description !== undefined ? description : category.description
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has articles
    const articleCount = await Article.count({ where: { categoryId: category.id } });
    if (articleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${articleCount} article(s) associated with it.`
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
