'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create segment_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE segment_status AS ENUM ('active','inactive','archived');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('customer_segments', {
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
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      filter_rules_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '{}'
      },
      status: {
        type: 'segment_status',
        allowNull: false,
        defaultValue: 'active'
      },
      customer_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      last_calculated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('customer_segments', ['business_id']);
    await queryInterface.addIndex('customer_segments', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_segments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS segment_status;');
  }
};

