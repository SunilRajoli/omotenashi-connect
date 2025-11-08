'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create note_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE note_type AS ENUM ('allergy','preference','restriction','special_need');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Customers table
    await queryInterface.createTable('customers', {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      preferences_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      no_show_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    // Customer notes
    await queryInterface.createTable('customer_notes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE'
      },
      note_type: {
        type: 'note_type',
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    // Indexes
    await queryInterface.addIndex('customer_notes', ['customer_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_notes');
    await queryInterface.dropTable('customers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS note_type;');
  }
};