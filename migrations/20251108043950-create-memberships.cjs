'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create membership_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE membership_type AS ENUM ('subscription','package','punch_card');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create membership_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE membership_status AS ENUM ('active','suspended','cancelled','expired');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create billing_cycle enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE billing_cycle AS ENUM ('monthly','quarterly','yearly');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('memberships', {
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
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE'
      },
      membership_type: {
        type: 'membership_type',
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      billing_cycle: {
        type: 'billing_cycle',
        allowNull: true
      },
      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      visits_included: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      visits_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      discount_percentage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      benefits: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '{}'
      },
      status: {
        type: 'membership_status',
        allowNull: false,
        defaultValue: 'active'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('memberships', ['business_id', 'customer_id']);
    await queryInterface.addIndex('memberships', ['status', 'end_date']);
    await queryInterface.addIndex('memberships', ['next_billing_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('memberships');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS membership_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS membership_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS billing_cycle;');
  }
};

