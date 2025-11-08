import { Queue, Worker, JobsOptions } from 'bullmq';
import { env } from './env';
import { ensureRedis } from './redis';

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
};

export async function makeQueue(name: string) {
  await ensureRedis();
  const queue = new Queue(name, { connection, defaultJobOptions: defaultJobOptions() });
  return { queue };
}

export function makeWorker<T = unknown>(
  name: string,
  processor: (job: { data: T }) => Promise<unknown>
) {
  return new Worker(name, async (job) => processor(job as { data: T }), { connection });
}

function defaultJobOptions(): JobsOptions {
  return {
    removeOnComplete: 1000,
    removeOnFail: 5000,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  };
}
