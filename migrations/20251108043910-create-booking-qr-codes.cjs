'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create qr_code_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE qr_code_status AS ENUM ('active','used','expired','cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('booking_qr_codes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      qr_code: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      qr_code_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      used_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      status: {
        type: 'qr_code_status',
        allowNull: false,
        defaultValue: 'active'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addIndex('booking_qr_codes', ['booking_id']);
    await queryInterface.addIndex('booking_qr_codes', ['qr_code_hash']);
    await queryInterface.addIndex('booking_qr_codes', ['status', 'expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_qr_codes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS qr_code_status;');
  }
};

