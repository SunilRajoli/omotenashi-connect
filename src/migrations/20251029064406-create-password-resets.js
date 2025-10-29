'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_resets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      token: { type: Sequelize.STRING(255), allowNull: false, unique: true }, // sha256 of raw token
      expires_at: { type: Sequelize.DATE, allowNull: false },
      consumed_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('password_resets', ['user_id','expires_at'], { name: 'ix_pwdreset_user_expires' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('password_resets');
  }
};
