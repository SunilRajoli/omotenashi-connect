import { Queue } from 'bullmq';
import { redis } from './redis.js';

export const Queues = {
  email: new Queue('email', { connection: redis }),
  reviews: new Queue('reviews', { connection: redis }),
  housekeeping: new Queue('housekeeping', { connection: redis })
};
