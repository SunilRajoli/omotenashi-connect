import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL);
redis.on('error', (e) => console.error('[Redis] error', e));
