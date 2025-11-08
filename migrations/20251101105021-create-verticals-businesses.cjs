'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enums
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE business_status AS ENUM ('pending_review','approved','suspended');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE onboarding_status AS ENUM ('incomplete','pending_verification','live');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Verticals table
    await queryInterface.createTable('verticals', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      slug: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      name_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name_ja: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      config_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      }
    });

    // Businesses table
    await queryInterface.createTable('businesses', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      vertical_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'verticals', key: 'id' }
      },
      slug: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      display_name_ja: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      display_name_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      name_kana: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_ja: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      postal_code: {
        type: Sequelize.CHAR(8),
        allowNull: true
      },
      prefecture: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      street: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      building: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timezone: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'Asia/Tokyo'
      },
      status: {
        type: 'business_status',
        allowNull: false,
        defaultValue: 'pending_review'
      },
      onboarding_status: {
        type: 'onboarding_status',
        allowNull: false,
        defaultValue: 'incomplete'
      },
      deleted_at: {
        type: Sequelize.DATE,
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

    // Add constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE businesses 
      ADD CONSTRAINT chk_businesses_postal_code 
      CHECK (postal_code ~ '^\\d{3}-\\d{4}$' OR postal_code IS NULL);
    `);

    // Indexes
    await queryInterface.addIndex('businesses', ['status']);
    await queryInterface.addIndex('businesses', ['owner_id']);
    await queryInterface.addIndex('businesses', ['slug']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('businesses');
    await queryInterface.dropTable('verticals');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS business_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS onboarding_status;');
  }
};