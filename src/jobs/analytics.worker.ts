/**
 * Analytics worker
 * Calculates daily analytics aggregates for businesses
 */

import { makeWorker } from '../config/bullmq';
import { QUEUE_NAMES } from './queues';
import { logger } from '../utils/logger';
import { AnalyticsDaily } from '../models/analyticsDaily.model';
import { Booking } from '../models/booking.model';
import { BookingPayment } from '../models/bookingPayment.model';
import { Review } from '../models/review.model';
import { BookingStatus, PaymentStatus } from '../types/enums';
import { sequelize } from '../config/sequelize';
import { Op } from 'sequelize';

interface AnalyticsJobData {
  businessId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Analytics worker processor
 */
async function processAnalyticsJob(job: { data: AnalyticsJobData }): Promise<void> {
  const { data } = job;
  
  try {
    logger.info(
      { jobId: job.job?.id, businessId: data.businessId, date: data.date },
      'Processing analytics job'
    );
    
    const startOfDay = new Date(`${data.date}T00:00:00Z`);
    const endOfDay = new Date(`${data.date}T23:59:59Z`);
    
    // Get bookings for the day
    const bookings = await Booking.findAll({
      where: {
        business_id: data.businessId,
        start_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
        deleted_at: null,
      },
      include: [
        {
          model: BookingPayment,
          as: 'payments',
          required: false,
        },
      ],
    });
    
    // Calculate metrics
    const totalBookings = bookings.length;
    
    // Revenue (from succeeded payments)
    const succeededPayments = bookings
      .flatMap((b) => b.payments || [])
      .filter((p) => p.status === PaymentStatus.SUCCEEDED);
    
    const revenueCents = succeededPayments.reduce(
      (sum, p) => sum + p.amount_cents,
      0
    );
    
    // Cancellations
    const cancellations = bookings.filter(
      (b) => b.status === BookingStatus.CANCELLED
    ).length;
    
    // No-shows
    const noShows = bookings.filter(
      (b) => b.status === BookingStatus.NO_SHOW
    ).length;
    
    // Average review rating
    const reviews = await Review.findAll({
      where: {
        business_id: data.businessId,
        created_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
        deleted_at: null,
        is_visible: true,
      },
    });
    
    const reviewAvg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
    
    // Upsert analytics daily record
    await AnalyticsDaily.upsert(
      {
        business_id: data.businessId,
        date: data.date,
        bookings: totalBookings,
        revenue_cents: revenueCents,
        cancellations,
        no_shows: noShows,
        review_avg: reviewAvg,
      },
      {
        conflictFields: ['business_id', 'date'],
      }
    );
    
    logger.info(
      {
        businessId: data.businessId,
        date: data.date,
        bookings: totalBookings,
        revenue: revenueCents,
      },
      'Analytics calculated'
    );
  } catch (error) {
    logger.error(
      { error, jobId: job.job?.id, businessId: data.businessId, date: data.date },
      'Analytics job failed'
    );
    throw error;
  }
}

/**
 * Create analytics worker
 */
export function createAnalyticsWorker() {
  return makeWorker<AnalyticsJobData>(QUEUE_NAMES.ANALYTICS, processAnalyticsJob);
}

/**
 * Start analytics worker
 */
export function startAnalyticsWorker() {
  const worker = createAnalyticsWorker();
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Analytics job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'Analytics job failed');
  });
  
  worker.on('error', (err) => {
    logger.error({ error: err }, 'Analytics worker error');
  });
  
  logger.info('Analytics worker started');
  return worker;
}

