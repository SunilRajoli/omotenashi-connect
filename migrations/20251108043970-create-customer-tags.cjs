'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create tag_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE tag_type AS ENUM ('manual','auto');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create tag_category enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE tag_category AS ENUM ('behavior','value','engagement','custom');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.createTable('customer_tags', {
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
      tag_name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tag_type: {
        type: 'tag_type',
        allowNull: false,
        defaultValue: 'manual'
      },
      category: {
        type: 'tag_category',
        allowNull: false,
        defaultValue: 'custom'
      },
      color: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      auto_rule_json: {
        type: Sequelize.JSONB,
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
      }
    });

    await queryInterface.addIndex('customer_tags', ['business_id', 'customer_id']);
    await queryInterface.addIndex('customer_tags', ['tag_name']);
    await queryInterface.addIndex('customer_tags', ['tag_type']);
    await queryInterface.addIndex('customer_tags', ['category']);
    // Unique constraint: one tag name per customer per business
    await queryInterface.addIndex('customer_tags', ['business_id', 'customer_id', 'tag_name'], {
      unique: true,
      name: 'customer_tags_business_customer_tag_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_tags');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tag_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tag_category;');
  }
};

