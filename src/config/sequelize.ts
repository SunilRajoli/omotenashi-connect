import { Sequelize } from 'sequelize';
import { env } from './env';

// Connection pool configuration based on environment
const getPoolConfig = () => {
  if (env.NODE_ENV === 'production') {
    return {
      min: 10,
      max: 50,
      idle: 10000, // 10 seconds
      acquire: 30000, // 30 seconds
      evict: 1000, // 1 second
    };
  } else if (env.NODE_ENV === 'test') {
    return {
      min: 2,
      max: 5,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    };
  } else {
    // Development
    return {
      min: 2,
      max: 10,
      idle: 10000,
      acquire: 30000,
      evict: 1000,
    };
  }
};

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
    useUTC: true,
  },
  pool: getPoolConfig(),
});

// Import all models so they get initialized with sequelize
// Models will call Model.init() when imported
import '../models';
