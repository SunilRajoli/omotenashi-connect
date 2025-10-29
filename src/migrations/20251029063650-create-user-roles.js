'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      role_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('user_roles', ['user_id','role_id'], { unique: true, name: 'ux_user_role' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_roles');
  }
};
