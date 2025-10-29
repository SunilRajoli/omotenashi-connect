import { Sequelize } from 'sequelize';
import { env, isProd } from './env.ts';

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASS,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    logging: !isProd ? console.log : false,
    dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {}
  }
);

/**
 * Models will be initialized in src/models/index.ts via initModels(sequelize).
 * Import and call from your app bootstrap after `sequelize.authenticate()`.
 */
