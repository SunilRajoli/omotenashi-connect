'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // gen_random_uuid() is available in Postgres if pgcrypto is enabled.
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(32) },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      full_name: { type: Sequelize.STRING(160) },
      avatar_url: { type: Sequelize.STRING(1024) },
      locale: { type: Sequelize.ENUM('ja','en'), allowNull: false, defaultValue: 'ja' },
      status: { type: Sequelize.ENUM('active','suspended'), allowNull: false, defaultValue: 'active' },
      email_verified_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_locale";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_status";`);
  }
};
