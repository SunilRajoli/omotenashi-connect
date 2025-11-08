'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable extensions
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS citext;');

    // Create user_role enum
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin','owner','staff','customer');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      email: {
        type: 'CITEXT',
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      family_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      given_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      family_name_kana: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      given_name_kana: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      display_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phone: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timezone: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'Asia/Tokyo'
      },
      role: {
        type: 'user_role',
        allowNull: false,
        defaultValue: 'customer'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD CONSTRAINT chk_users_phone_format 
      CHECK (phone ~ '^(0\\d{1,4}-?\\d{1,4}-?\\d{4}|)$' OR phone IS NULL);
    `);

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role', 'is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS user_role;');
  }
};