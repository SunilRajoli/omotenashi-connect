'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Staff assignments already created in migration 008
    console.log('Staff assignments already exist from migration 008');
  },

  async down(queryInterface, Sequelize) {
    // No-op
  }
};