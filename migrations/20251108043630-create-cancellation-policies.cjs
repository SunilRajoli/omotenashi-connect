'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cancellation policies already created in migration 006
    console.log('Cancellation policies table already exists from migration 006');
  },

  async down(queryInterface, Sequelize) {
    // No-op
  }
};