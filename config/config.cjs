// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'omotenashi',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  seederStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_meta',
  dialectOptions: { useUTC: true },
  timezone: '+00:00' // store as UTC
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME_TEST || 'omotenashi_test' },
  production: { ...base }
};
