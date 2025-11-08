'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rate limits table
    await queryInterface.createTable('rate_limits', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      key: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      window_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('rate_limits', {
      fields: ['key', 'window_start'],
      type: 'unique',
      name: 'unique_rate_limit_window'
    });

    await queryInterface.addConstraint('rate_limits', {
      fields: ['count'],
      type: 'check',
      where: {
        count: {
          [Sequelize.Op.gt]: 0
        }
      }
    });

    await queryInterface.addIndex('rate_limits', ['key', 'expires_at']);

    // Feature flags table
    await queryInterface.createTable('feature_flags', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rollout_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      target_user_ids: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      target_business_ids: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
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

    await queryInterface.addConstraint('feature_flags', {
      fields: ['rollout_percent'],
      type: 'check',
      where: {
        rollout_percent: {
          [Sequelize.Op.between]: [0, 100]
        }
      }
    });

    // Create updated_at trigger function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Apply updated_at triggers to all tables with that column
    const tablesWithUpdatedAt = [
      'users', 'businesses', 'business_settings', 'services', 'resources',
      'bookings', 'booking_payments', 'reviews', 'feature_flags'
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table};
        CREATE TRIGGER trg_${table}_updated_at 
        BEFORE UPDATE ON ${table} 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create views
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW active_bookings AS
      SELECT 
        b.*,
        s.name_ja AS service_name,
        r.name AS resource_name,
        c.name AS customer_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN resources r ON b.resource_id = r.id
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.deleted_at IS NULL
        AND b.status IN ('pending', 'confirmed', 'pending_payment');
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW business_metrics_30d AS
      SELECT 
        biz.id AS business_id,
        COUNT(bk.id) AS total_bookings,
        COALESCE(SUM(CASE WHEN bp.status='succeeded' THEN bp.amount_cents END), 0) AS total_revenue,
        AVG(rvw.rating) AS avg_rating,
        COUNT(DISTINCT bk.customer_id) AS unique_customers
      FROM businesses biz
      LEFT JOIN bookings bk ON biz.id = bk.business_id 
        AND bk.created_at > now() - INTERVAL '30 days'
      LEFT JOIN booking_payments bp ON bk.id = bp.booking_id 
        AND bp.status = 'succeeded'
      LEFT JOIN reviews rvw ON biz.id = rvw.business_id 
        AND rvw.created_at > now() - INTERVAL '30 days'
      WHERE biz.deleted_at IS NULL
      GROUP BY biz.id;
    `);

    console.log('Hardening and locale features applied successfully');
  },

  async down(queryInterface, Sequelize) {
    // Drop views
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS business_metrics_30d;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS active_bookings;');

    // Drop triggers
    const tablesWithUpdatedAt = [
      'users', 'businesses', 'business_settings', 'services', 'resources',
      'bookings', 'booking_payments', 'reviews', 'feature_flags'
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table};`);
    }

    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_at_column();');

    // Drop tables
    await queryInterface.dropTable('feature_flags');
    await queryInterface.dropTable('rate_limits');
  }
};