'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create membership_payment_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE membership_payment_status AS ENUM ('pending','processing','succeeded','failed','refunded');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('membership_payments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      membership_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'memberships', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount_cents: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'JPY'
      },
      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      payment_intent_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: 'membership_payment_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failure_reason: {
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

    await queryInterface.addIndex('membership_payments', ['membership_id']);
    await queryInterface.addIndex('membership_payments', ['status']);
    await queryInterface.addIndex('membership_payments', ['payment_intent_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('membership_payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS membership_payment_status;');
  }
};

