'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      key: { type: Sequelize.ENUM('user','owner','staff','admin'), allowNull: false, unique: true },
      name_ja: { type: Sequelize.STRING, allowNull: false },
      name_en: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_roles_key";`);
  }
};
