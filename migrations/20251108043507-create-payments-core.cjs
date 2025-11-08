'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enums
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE payment_mode AS ENUM ('deposit','full','hold','pay_on_arrival');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending','succeeded','failed','refunded');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Booking payments
    await queryInterface.createTable('booking_payments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      provider_charge_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      provider_intent_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      amount_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'JPY'
      },
      mode: {
        type: 'payment_mode',
        allowNull: false
      },
      status: {
        type: 'payment_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      raw_response: {
        type: Sequelize.JSONB,
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

    // Idempotency keys
    await queryInterface.createTable('idempotency_keys', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      scope: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      request_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      response_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('idempotency_keys', {
      fields: ['scope', 'request_hash'],
      type: 'unique',
      name: 'unique_idempotency_key'
    });

    // Payment webhooks
    await queryInterface.createTable('payment_webhooks', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      provider: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event_type: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payload_json: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    // Indexes
    await queryInterface.addIndex('booking_payments', ['booking_id']);
    await queryInterface.addIndex('booking_payments', ['status', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_webhooks');
    await queryInterface.dropTable('idempotency_keys');
    await queryInterface.dropTable('booking_payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS payment_mode;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS payment_status;');
  }
};