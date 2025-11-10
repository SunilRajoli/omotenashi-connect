'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add BALANCE to payment_mode enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE payment_mode ADD VALUE IF NOT EXISTS 'balance';
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Add payment_type column
    await queryInterface.addColumn('booking_payments', 'payment_type', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add is_deposit column
    await queryInterface.addColumn('booking_payments', 'is_deposit', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Update existing records: if mode is 'deposit', set is_deposit = true and payment_type = 'deposit'
    await queryInterface.sequelize.query(`
      UPDATE booking_payments 
      SET is_deposit = (mode = 'deposit'),
          payment_type = CASE 
            WHEN mode = 'deposit' THEN 'deposit'
            WHEN mode = 'full' THEN 'full'
            ELSE 'balance'
          END
      WHERE payment_type IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('booking_payments', 'is_deposit');
    await queryInterface.removeColumn('booking_payments', 'payment_type');

    // Note: Cannot remove enum value, but can drop and recreate if needed
  }
};

