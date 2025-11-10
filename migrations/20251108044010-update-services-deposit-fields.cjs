'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add deposit-related columns to services table
    await queryInterface.addColumn('services', 'requires_deposit', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('services', 'deposit_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('services', 'deposit_due_hours', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 24
    });

    // Add check constraint for deposit_percentage
    await queryInterface.sequelize.query(`
      ALTER TABLE services 
      ADD CONSTRAINT chk_services_deposit_percentage 
      CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE services 
      DROP CONSTRAINT IF EXISTS chk_services_deposit_percentage;
    `);

    await queryInterface.removeColumn('services', 'deposit_due_hours');
    await queryInterface.removeColumn('services', 'deposit_percentage');
    await queryInterface.removeColumn('services', 'requires_deposit');
  }
};

