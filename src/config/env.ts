import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().url().default('http://localhost:4000'),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_SSL: z.string().default('false').transform(v => v === 'true'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  MAIL_PROVIDER: z.enum(['ses','sendgrid','console']).default('console'),
  MAIL_FROM: z.string().default('Omotenashi <noreply@omotenashi.local>'),

  DEFAULT_LOCALE: z.enum(['ja','en']).default('ja'),
  SWAGGER_PATH: z.string().default('/docs')
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
