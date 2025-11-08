'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Business hours
    await queryInterface.createTable('business_hours', {
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
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      open_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      close_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      is_closed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });

    await queryInterface.addConstraint('business_hours', {
      fields: ['day_of_week'],
      type: 'check',
      where: {
        day_of_week: {
          [Sequelize.Op.between]: [0, 6]
        }
      }
    });

    await queryInterface.addConstraint('business_hours', {
      fields: ['business_id', 'day_of_week'],
      type: 'unique',
      name: 'unique_business_day'
    });

    // Business holidays
    await queryInterface.createTable('business_holidays', {
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
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('business_holidays', {
      fields: ['business_id', 'date'],
      type: 'unique',
      name: 'unique_business_holiday'
    });

    // Business media
    await queryInterface.createTable('business_media', {
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
      caption_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      caption_ja: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      uploaded_by: {
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

    await queryInterface.addConstraint('business_media', {
      fields: ['type'],
      type: 'check',
      where: {
        type: {
          [Sequelize.Op.in]: ['image', 'video']
        }
      }
    });

    // Indexes
    await queryInterface.addIndex('business_hours', ['business_id']);
    await queryInterface.addIndex('business_holidays', ['business_id', 'date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_media');
    await queryInterface.dropTable('business_holidays');
    await queryInterface.dropTable('business_hours');
  }
};