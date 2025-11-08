'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_resources', {
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
      resource_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE'
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('service_resources', {
      fields: ['service_id', 'resource_id'],
      type: 'unique',
      name: 'unique_service_resource'
    });

    await queryInterface.addIndex('service_resources', ['service_id']);
    await queryInterface.addIndex('service_resources', ['resource_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_resources');
  }
};