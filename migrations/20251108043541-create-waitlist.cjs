'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create waitlist_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE waitlist_status AS ENUM ('active','notified','converted','cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('waitlist', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE'
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'services', key: 'id' }
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL'
      },
      preferred_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      preferred_time_start: {
        type: Sequelize.TIME,
        allowNull: true
      },
      preferred_time_end: {
        type: Sequelize.TIME,
        allowNull: true
      },
      status: {
        type: 'waitlist_status',
        allowNull: false,
        defaultValue: 'active'
      },
      notified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addIndex('waitlist', ['business_id', 'service_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('waitlist');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS waitlist_status;');
  }
};