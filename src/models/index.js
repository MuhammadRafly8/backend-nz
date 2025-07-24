const User = require('./User');
const Article = require('./Article');
const Category = require('./Category');

// User - Article (One-to-Many)
User.hasMany(Article, { foreignKey: 'authorId' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Category - Article (One-to-Many)
Category.hasMany(Article, { foreignKey: 'categoryId' });
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  User,
  Article,
  Category
};