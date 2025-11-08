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
import { Op, WhereOptions } from 'sequelize';
import { Job } from 'bullmq';

interface AnalyticsJobData {
  businessId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Analytics worker processor
 */
async function processAnalyticsJob(job: Job<AnalyticsJobData>): Promise<void> {
  const data = job.data;
  
  try {
    logger.info(
      { jobId: job.id, businessId: data.businessId, date: data.date },
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
        deleted_at: { [Op.is]: null },
      } as WhereOptions<typeof Booking.prototype>,
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
      .flatMap((b) => (b.get('payments') as BookingPayment[]) || [])
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
        deleted_at: { [Op.is]: null },
        is_visible: true,
      } as WhereOptions<typeof Review.prototype>,
    });
    
    const reviewAvg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : undefined;
    
    // Upsert analytics daily record
    // Note: DATEONLY returns a string, so we use the date string directly
    await AnalyticsDaily.upsert(
      {
        business_id: data.businessId,
        date: data.date as unknown as Date, // DATEONLY accepts string but interface expects Date
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
      { error, jobId: job.id, businessId: data.businessId, date: data.date },
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
    logger.info({ jobId: job?.id }, 'Analytics job completed');
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

