import { Queue, Worker, JobsOptions, Job } from 'bullmq';
import { env } from './env';
import { ensureRedis } from './redis';

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT
};

export async function makeQueue(name: string) {
  // In test mode, skip Redis connection
  if (process.env.NODE_ENV === 'test') {
    // Return a mock queue that doesn't require Redis
    return {
      queue: {
        add: async () => ({ id: 'mock-job-id' }),
        close: async () => {},
      } as unknown as Queue,
    };
  }
  
  await ensureRedis();
  const queue = new Queue(name, { connection, defaultJobOptions: defaultJobOptions() });
  return { queue };
}

export function makeWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<unknown>
) {
  return new Worker(name, async (job) => processor(job), { connection });
}

function defaultJobOptions(): JobsOptions {
  return {
    removeOnComplete: 1000,
    removeOnFail: 5000,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  };
}
