'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable btree_gist extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');

    // Create enums
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('pending','pending_payment','confirmed','completed','cancelled','no_show','expired');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE booking_source AS ENUM ('web','owner_portal','phone','import');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Bookings table
    await queryInterface.createTable('bookings', {
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
      resource_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'resources', key: 'id' }
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      start_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: 'booking_status',
        allowNull: false
      },
      source: {
        type: 'booking_source',
        allowNull: false,
        defaultValue: 'web'
      },
      price_snapshot_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      policy_snapshot_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add time order check
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT chk_bookings_time_order 
      CHECK (end_at > start_at);
    `);

    // Add overlap prevention (CRITICAL!)
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings
      ADD CONSTRAINT no_overlap
      EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_at, end_at) WITH &&
      )
      WHERE (deleted_at IS NULL);
    `);

    // Indexes
    await queryInterface.addIndex('bookings', ['business_id', 'start_at']);
    await queryInterface.addIndex('bookings', ['customer_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS booking_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS booking_source;');
  }
};