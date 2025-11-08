'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Staff working hours
    await queryInterface.createTable('staff_working_hours', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      resource_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE'
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      }
    });

    await queryInterface.addConstraint('staff_working_hours', {
      fields: ['day_of_week'],
      type: 'check',
      where: {
        day_of_week: {
          [Sequelize.Op.between]: [0, 6]
        }
      }
    });

    // Staff exceptions
    await queryInterface.createTable('staff_exceptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      resource_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      is_working: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Staff assignments
    await queryInterface.createTable('staff_assignments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      permissions_json: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      hired_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      },
      terminated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('staff_assignments', {
      fields: ['role'],
      type: 'check',
      where: {
        role: {
          [Sequelize.Op.in]: ['manager', 'receptionist', 'service_provider']
        }
      }
    });

    await queryInterface.addConstraint('staff_assignments', {
      fields: ['user_id', 'business_id'],
      type: 'unique',
      name: 'unique_staff_assignment'
    });

    await queryInterface.addIndex('staff_assignments', ['business_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staff_assignments');
    await queryInterface.dropTable('staff_exceptions');
    await queryInterface.dropTable('staff_working_hours');
  }
};