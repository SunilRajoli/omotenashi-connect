import { createClient } from 'redis';
import { env } from './env';

export const redis = createClient({
  url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`
});

redis.on('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('Redis error:', e);
});

export async function ensureRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}
