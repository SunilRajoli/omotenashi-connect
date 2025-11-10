'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create pricing_modifier_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE pricing_modifier_type AS ENUM ('percentage','fixed');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('pricing_rules', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'services', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      day_of_week: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      price_modifier: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      modifier_type: {
        type: 'pricing_modifier_type',
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('pricing_rules', ['service_id', 'is_active']);
    await queryInterface.addIndex('pricing_rules', ['priority']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pricing_rules');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS pricing_modifier_type;');
  }
};

