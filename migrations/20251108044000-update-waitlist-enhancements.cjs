'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add EXPIRED to waitlist_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE waitlist_status ADD VALUE IF NOT EXISTS 'expired';
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create waitlist_priority enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE waitlist_priority AS ENUM ('low','normal','high','vip');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Add new columns to waitlist table
    await queryInterface.addColumn('waitlist', 'priority', {
      type: 'waitlist_priority',
      allowNull: false,
      defaultValue: 'normal'
    });

    await queryInterface.addColumn('waitlist', 'response_deadline', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('waitlist', 'notification_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('waitlist', 'last_notified_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add indexes
    await queryInterface.addIndex('waitlist', ['status', 'priority']);
    await queryInterface.addIndex('waitlist', ['response_deadline']);
    await queryInterface.addIndex('waitlist', ['customer_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('waitlist', ['customer_id']);
    await queryInterface.removeIndex('waitlist', ['response_deadline']);
    await queryInterface.removeIndex('waitlist', ['status', 'priority']);

    await queryInterface.removeColumn('waitlist', 'last_notified_at');
    await queryInterface.removeColumn('waitlist', 'notification_count');
    await queryInterface.removeColumn('waitlist', 'response_deadline');
    await queryInterface.removeColumn('waitlist', 'priority');

    // Note: Cannot remove enum value, but can drop and recreate if needed
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS waitlist_priority;');
  }
};

