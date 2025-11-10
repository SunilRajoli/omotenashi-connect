'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('line_users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      line_user_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      display_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      picture_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      language: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('line_users', ['user_id']);
    await queryInterface.addIndex('line_users', ['line_user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('line_users');
  }
};

