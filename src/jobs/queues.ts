/**
 * Queue definitions
 * BullMQ queue setup for async job processing
 */

import { Queue } from 'bullmq';
import { makeQueue } from '../config/bullmq';
import { logger } from '../utils/logger';

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  BOOKING_REMINDER: 'booking-reminder',
  ANALYTICS: 'analytics',
  EXPIRE_BOOKINGS: 'expire-bookings',
  WEBHOOK: 'webhook',
} as const;

// Queue instances (lazy-loaded)
const queues: Record<string, Queue> = {};

/**
 * Get or create a queue instance
 */
export async function getQueue(name: string): Promise<Queue> {
  if (!queues[name]) {
    const { queue } = await makeQueue(name);
    queues[name] = queue;
    logger.info({ queue: name }, 'Queue initialized');
  }
  return queues[name];
}

/**
 * Get email queue
 */
export async function getEmailQueue(): Promise<Queue> {
  return getQueue(QUEUE_NAMES.EMAIL);
}

/**
 * Get booking reminder queue
 */
export async function getBookingReminderQueue(): Promise<Queue> {
  return getQueue(QUEUE_NAMES.BOOKING_REMINDER);
}

/**
 * Get analytics queue
 */
export async function getAnalyticsQueue(): Promise<Queue> {
  return getQueue(QUEUE_NAMES.ANALYTICS);
}

/**
 * Get expire bookings queue
 */
export async function getExpireBookingsQueue(): Promise<Queue> {
  return getQueue(QUEUE_NAMES.EXPIRE_BOOKINGS);
}

/**
 * Get webhook queue
 */
export async function getWebhookQueue(): Promise<Queue> {
  return getQueue(QUEUE_NAMES.WEBHOOK);
}

/**
 * Add job to email queue
 */
export async function addEmailJob(data: {
  to: string;
  subject: string;
  html: string;
  locale?: 'ja' | 'en';
  scheduledAt?: Date;
  notificationId?: string;
}) {
  const queue = await getEmailQueue();
  return queue.add('send-email', data, {
    delay: data.scheduledAt ? new Date(data.scheduledAt).getTime() - Date.now() : 0,
  });
}

/**
 * Add job to booking reminder queue
 */
export async function addBookingReminderJob(data: {
  bookingId: string;
  reminderType: '24h' | '1h';
  scheduledAt: Date;
}) {
  const queue = await getBookingReminderQueue();
  return queue.add('send-reminder', data, {
    delay: new Date(data.scheduledAt).getTime() - Date.now(),
  });
}

/**
 * Add job to analytics queue
 */
export async function addAnalyticsJob(data: {
  businessId: string;
  date: string; // YYYY-MM-DD
}) {
  const queue = await getAnalyticsQueue();
  return queue.add('calculate-daily', data);
}

/**
 * Add job to expire bookings queue
 */
export async function addExpireBookingsJob() {
  const queue = await getExpireBookingsQueue();
  return queue.add('expire-pending', {}, {
    repeat: {
      pattern: '*/30 * * * *', // Every 30 minutes
    },
  });
}

/**
 * Add job to webhook queue
 */
export async function addWebhookJob(data: {
  provider: 'stripe' | 'payjp';
  eventType: string;
  payload: Record<string, unknown>;
  signature?: string;
  retryCount?: number;
  webhookId?: string;
}) {
  const queue = await getWebhookQueue();
  return queue.add('process-webhook', data, {
    attempts: data.retryCount || 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

/**
 * Close all queues gracefully
 */
export async function closeAllQueues(): Promise<void> {
  await Promise.all(
    Object.values(queues).map((queue) => queue.close())
  );
  logger.info('All queues closed');
}

