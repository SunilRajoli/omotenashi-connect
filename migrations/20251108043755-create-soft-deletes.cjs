'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Soft deletes (deleted_at) already added to tables during creation
    console.log('Soft delete columns already exist in relevant tables');
  },

  async down(queryInterface, Sequelize) {
    // No-op
  }
};