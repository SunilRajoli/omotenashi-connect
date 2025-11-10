'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add PENDING_DEPOSIT to booking_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_deposit';
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: Cannot remove enum value, but can drop and recreate if needed
  }
};

