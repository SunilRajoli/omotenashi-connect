import { Sequelize } from 'sequelize';
import { env } from './env';

// Use UTC at DB layer; app renders JST where needed
export const sequelize = new Sequelize({
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASS,
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+00:00', // UTC timezone
  dialectOptions: {
    useUTC: true
  },
});

// Import all models so they get initialized with sequelize
// Models will call Model.init() when imported
import '../models';
