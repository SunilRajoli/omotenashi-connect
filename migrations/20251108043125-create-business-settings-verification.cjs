'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create verification_status enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE verification_status AS ENUM ('pending','approved','rejected');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Business settings
    await queryInterface.createTable('business_settings', {
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
      logo_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      primary_color: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      secondary_color: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      font_family: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      default_locale: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'ja'
      },
      domain: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      theme_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
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

    // Business verifications
    await queryInterface.createTable('business_verifications', {
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
      status: {
        type: 'verification_status',
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    // Business documents
    await queryInterface.createTable('business_documents', {
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
      type: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'pending'
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_documents');
    await queryInterface.dropTable('business_verifications');
    await queryInterface.dropTable('business_settings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS verification_status;');
  }
};