'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('writer123', salt);
    const hashedPassword2 = await bcrypt.hash('editor123', salt);
    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: 'Writer Satu',
        email: 'writer1@portalberita.com',
        password: hashedPassword,
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Writer Dua',
        email: 'writer2@portalberita.com',
        password: hashedPassword,
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Writer Tiga',
        email: 'writer3@portalberita.com',
        password: hashedPassword2,
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', {
      email: [
        'writer1@portalberita.com',
        'writer2@portalberita.com',
        'writer3@portalberita.com'
      ]
    }, {});
  }
}; 