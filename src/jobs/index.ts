/**
 * Jobs index
 * Start all workers and manage queue lifecycle
 */

import { logger } from '../utils/logger';
import { startEmailWorker } from './email.worker';
import { startBookingReminderWorker } from './booking-reminder.worker';
import { startAnalyticsWorker } from './analytics.worker';
import { startExpireBookingsWorker } from './expire-bookings.worker';
import { startWebhookWorker } from './webhook.worker';
import { closeAllQueues } from './queues';
import { addExpireBookingsJob } from './queues';

/**
 * Start all workers
 */
export function startAllWorkers() {
  logger.info('Starting all workers...');
  
  const workers = [
    startEmailWorker(),
    startBookingReminderWorker(),
    startAnalyticsWorker(),
    startExpireBookingsWorker(),
    startWebhookWorker(),
  ];
  
  // Schedule recurring jobs
  scheduleRecurringJobs();
  
  logger.info('All workers started');
  
  return workers;
}

/**
 * Schedule recurring jobs
 */
async function scheduleRecurringJobs() {
  try {
    // Schedule expire bookings job (runs every 30 minutes)
    await addExpireBookingsJob();
    logger.info('Recurring jobs scheduled');
  } catch (error) {
    logger.error({ error }, 'Failed to schedule recurring jobs');
  }
}

/**
 * Gracefully shutdown all workers
 */
export async function shutdownWorkers(workers: ReturnType<typeof startAllWorkers>) {
  logger.info('Shutting down workers...');
  
  await Promise.all(workers.map((worker) => worker.close()));
  await closeAllQueues();
  
  logger.info('All workers shut down');
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down workers...');
  // Workers will be closed by the shutdown handler
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down workers...');
  // Workers will be closed by the shutdown handler
  process.exit(0);
});

