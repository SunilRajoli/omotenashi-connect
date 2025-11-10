'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create invoice_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_type AS ENUM ('receipt','invoice','quote');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create invoice_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_status AS ENUM ('draft','issued','paid','cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('invoices', {
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
      booking_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'SET NULL'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL'
      },
      invoice_number: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      type: {
        type: 'invoice_type',
        allowNull: false
      },
      status: {
        type: 'invoice_status',
        allowNull: false,
        defaultValue: 'draft'
      },
      issue_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subtotal_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tax_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'JPY'
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.1
      },
      items_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      billing_address_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      pdf_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pdf_storage_key: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('invoices', ['business_id']);
    await queryInterface.addIndex('invoices', ['booking_id']);
    await queryInterface.addIndex('invoices', ['customer_id']);
    await queryInterface.addIndex('invoices', ['invoice_number']);
    await queryInterface.addIndex('invoices', ['status', 'issue_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS invoice_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS invoice_status;');
  }
};

