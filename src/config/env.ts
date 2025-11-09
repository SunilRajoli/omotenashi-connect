import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // DB
  DB_HOST: required('DB_HOST', '127.0.0.1'),
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: required('DB_NAME', 'omotenashi'),
  DB_USER: required('DB_USER', 'postgres'),
  DB_PASS: required('DB_PASS', 'postgres'),

  // JWT
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '30d',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 12),

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),

  // Storage
  AWS_REGION: process.env.AWS_REGION || 'ap-northeast-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET || 'omotenashi-media',

  // Payments
  PAY_PROVIDER: (process.env.PAY_PROVIDER || 'payjp') as 'payjp' | 'stripe',
  PAYJP_SECRET: process.env.PAYJP_SECRET || '',
  STRIPE_SECRET: process.env.STRIPE_SECRET || '',

  // App limits/settings
  MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  WEBHOOK_RETRY_MAX: Number(process.env.WEBHOOK_RETRY_MAX || 5),
  ANALYTICS_SCHEDULE_CRON: process.env.ANALYTICS_SCHEDULE_CRON || '0 2 * * *',
  BOOKING_EXPIRY_MINUTES: Number(process.env.BOOKING_EXPIRY_MINUTES || 30),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Email (SendGrid)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@omotenashi-connect.com',
  FROM_NAME: process.env.FROM_NAME || 'Omotenashi Connect',
  APP_URL: process.env.APP_URL || 'http://localhost:4000',
};
