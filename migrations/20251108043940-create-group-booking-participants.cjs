'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create participant_payment_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE participant_payment_status AS ENUM ('pending','paid','refunded');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('group_booking_participants', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      group_booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'group_bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount_owed_cents: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      payment_status: {
        type: 'participant_payment_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      checked_in: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      checked_in_at: {
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

    await queryInterface.addIndex('group_booking_participants', ['group_booking_id']);
    await queryInterface.addIndex('group_booking_participants', ['customer_id']);
    await queryInterface.addIndex('group_booking_participants', ['payment_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_booking_participants');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS participant_payment_status;');
  }
};

