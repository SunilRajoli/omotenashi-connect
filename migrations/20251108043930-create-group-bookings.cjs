'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create group_booking_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE group_booking_status AS ENUM ('pending','confirmed','cancelled','completed');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create payment_split_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE payment_split_type AS ENUM ('organizer_pays','split_equal','individual');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('group_bookings', {
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
        references: { model: 'services', key: 'id' },
        onDelete: 'SET NULL'
      },
      organizer_customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE'
      },
      group_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      min_participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      current_participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      start_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      total_amount_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payment_split_type: {
        type: 'payment_split_type',
        allowNull: false
      },
      status: {
        type: 'group_booking_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '{}'
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

    await queryInterface.addIndex('group_bookings', ['business_id']);
    await queryInterface.addIndex('group_bookings', ['organizer_customer_id']);
    await queryInterface.addIndex('group_bookings', ['status', 'start_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_bookings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS group_booking_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS payment_split_type;');
  }
};

