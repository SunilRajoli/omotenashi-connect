'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Audit logs
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      actor_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      actor_role: {
        type: 'user_role',
        allowNull: true
      },
      entity: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      action: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      before_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      after_json: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ip: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ua: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    // Notifications outbox
    await queryInterface.createTable('notifications_outbox', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      kind: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      to_email: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      to_phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      locale: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'ja'
      },
      tone: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'polite'
      },
      template: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data_json: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      delivery_status: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('notifications_outbox', {
      fields: ['delivery_status'],
      type: 'check',
      where: {
        delivery_status: {
          [Sequelize.Op.in]: ['queued', 'sent', 'delivered', 'failed', 'bounced']
        }
      }
    });

    // Analytics daily
    await queryInterface.createTable('analytics_daily', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      bookings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      revenue_cents: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cancellations: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      no_shows: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      review_avg: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('analytics_daily', {
      fields: ['business_id', 'date'],
      type: 'unique',
      name: 'unique_business_date'
    });

    // Indexes
    await queryInterface.addIndex('audit_logs', ['entity', 'entity_id']);
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_notifications_scheduled 
      ON notifications_outbox(scheduled_at) 
      WHERE sent_at IS NULL;
    `);
    await queryInterface.addIndex('analytics_daily', ['business_id', 'date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('analytics_daily');
    await queryInterface.dropTable('notifications_outbox');
    await queryInterface.dropTable('audit_logs');
  }
};