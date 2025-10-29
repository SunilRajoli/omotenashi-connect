'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      token: { type: Sequelize.STRING(255), allowNull: false, unique: true }, // sha256 hash of JWT refresh token
      user_agent: { type: Sequelize.STRING(1024) },
      ip: { type: Sequelize.STRING(64) },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id','expires_at'], { name: 'ix_refresh_user_expires' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  }
};
