'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Articles', 'featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('Articles', 'department', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Department/Jurusan for the article (rpl, tkj, mm, etc.)'
    });

    await queryInterface.addColumn('Articles', 'metaDescription', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'SEO meta description'
    });

    await queryInterface.addColumn('Articles', 'tags', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Comma-separated tags for the article'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Articles', ['published', 'featured']);
    await queryInterface.addIndex('Articles', ['department']);
    await queryInterface.addIndex('Articles', ['publishedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('Articles', ['published', 'featured']);
    await queryInterface.removeIndex('Articles', ['department']);
    await queryInterface.removeIndex('Articles', ['publishedAt']);

    // Remove columns
    await queryInterface.removeColumn('Articles', 'featured');
    await queryInterface.removeColumn('Articles', 'department');
    await queryInterface.removeColumn('Articles', 'metaDescription');
    await queryInterface.removeColumn('Articles', 'tags');
  }
};
