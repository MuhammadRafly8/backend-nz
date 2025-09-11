const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Department/Jurusan for the article (rpl, tkj, mm, etc.)'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta description'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma-separated tags for the article'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['published', 'featured']
    },
    {
      fields: ['department']
    },
    {
      fields: ['publishedAt']
    }
  ]
});

module.exports = Article;