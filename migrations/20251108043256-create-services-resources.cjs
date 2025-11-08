'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create resource_type enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE resource_type AS ENUM ('staff','room','table','trainer');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Cancellation policies (needs to exist before services)
    await queryInterface.createTable('cancellation_policies', {
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
      hours_before: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      penalty_percent: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('cancellation_policies', {
      fields: ['penalty_percent'],
      type: 'check',
      where: {
        penalty_percent: {
          [Sequelize.Op.between]: [0, 100]
        }
      }
    });

    // Unique index for default policy per business
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX ux_policy_default_per_biz 
      ON cancellation_policies(business_id) 
      WHERE is_default = TRUE;
    `);

    // Services table
    await queryInterface.createTable('services', {
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
      category: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      name_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name_ja: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_ja: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      price_cents: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      buffer_before: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      buffer_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      policy_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'cancellation_policies', key: 'id' }
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.sequelize.query(`
      ALTER TABLE services 
      ADD CONSTRAINT chk_services_duration 
      CHECK (duration_minutes IS NULL OR duration_minutes > 0);
    `);

    // Resources table
    await queryInterface.createTable('resources', {
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
        type: 'resource_type',
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      attributes_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_services_active 
      ON services(business_id) 
      WHERE deleted_at IS NULL AND is_active = TRUE;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_resources_active 
      ON resources(business_id, type) 
      WHERE deleted_at IS NULL AND is_active = TRUE;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('services');
    await queryInterface.dropTable('cancellation_policies');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS resource_type;');
  }
};