/**
 * Expire bookings worker
 * Expires pending bookings that haven't been paid within the time limit
 */

import { makeWorker } from '../config/bullmq';
import { QUEUE_NAMES } from './queues';
import { logger } from '../utils/logger';
import { Booking } from '../models/booking.model';
import { BookingStatus } from '../types/enums';
import { env } from '../config/env';
import { Op } from 'sequelize';
import { addMinutesToDate } from '../utils/dates';

interface ExpireBookingsJobData {
  // No data needed - processes all expired bookings
}

/**
 * Expire bookings worker processor
 */
async function processExpireBookingsJob(
  job: { data: ExpireBookingsJobData }
): Promise<void> {
  try {
    logger.info({ jobId: job.job?.id }, 'Processing expire bookings job');
    
    const expiryMinutes = env.BOOKING_EXPIRY_MINUTES || 30;
    const expiryThreshold = addMinutesToDate(new Date(), -expiryMinutes);
    
    // Find pending bookings that are past expiry time
    const expiredBookings = await Booking.findAll({
      where: {
        status: {
          [Op.in]: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT],
        },
        created_at: {
          [Op.lt]: expiryThreshold,
        },
        deleted_at: null,
      },
      limit: 100, // Process in batches
    });
    
    if (expiredBookings.length === 0) {
      logger.info('No expired bookings to process');
      return;
    }
    
    // Update bookings to expired status
    const bookingIds = expiredBookings.map((b) => b.id);
    await Booking.update(
      {
        status: BookingStatus.EXPIRED,
      },
      {
        where: {
          id: {
            [Op.in]: bookingIds,
          },
        },
      }
    );
    
    logger.info(
      { count: expiredBookings.length, bookingIds },
      'Bookings expired'
    );
  } catch (error) {
    logger.error({ error, jobId: job.job?.id }, 'Expire bookings job failed');
    throw error;
  }
}

/**
 * Create expire bookings worker
 */
export function createExpireBookingsWorker() {
  return makeWorker<ExpireBookingsJobData>(
    QUEUE_NAMES.EXPIRE_BOOKINGS,
    processExpireBookingsJob
  );
}

/**
 * Start expire bookings worker
 */
export function startExpireBookingsWorker() {
  const worker = createExpireBookingsWorker();
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Expire bookings job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'Expire bookings job failed');
  });
  
  worker.on('error', (err) => {
    logger.error({ error: err }, 'Expire bookings worker error');
  });
  
  logger.info('Expire bookings worker started');
  return worker;
}

