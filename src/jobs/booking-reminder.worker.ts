/**
 * Booking reminder worker
 * Sends reminder notifications for upcoming bookings
 */

import { makeWorker } from '../config/bullmq';
import { QUEUE_NAMES } from './queues';
import { logger } from '../utils/logger';
import { Booking } from '../models/booking.model';
import { BookingReminder } from '../models/bookingReminder.model';
import { NotificationOutbox, DeliveryStatus } from '../models/notificationOutbox.model';
import { Customer } from '../models/customer.model';
import { Service } from '../models/service.model';
import { Resource } from '../models/resource.model';
import { Business } from '../models/business.model';
import { BusinessSettings } from '../models/businessSettings.model';
import { addEmailJob } from './queues';
import { formatDateTimeJapanese, formatDateTime } from '../utils/dates';
import { sequelize } from '../config/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Job } from 'bullmq';

interface BookingReminderJobData {
  bookingId: string;
  reminderType: '24h' | '1h';
  scheduledAt: Date;
}

/**
 * Booking reminder worker processor
 */
async function processBookingReminderJob(
  job: Job<BookingReminderJobData>
): Promise<void> {
  const data = job.data;
  
  try {
    logger.info(
      { jobId: job.id, bookingId: data.bookingId, type: data.reminderType },
      'Processing booking reminder job'
    );
    
    // Find booking
    const booking = await Booking.findByPk(data.bookingId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Service, as: 'service' },
        { model: Resource, as: 'resource' },
        {
          model: Business,
          as: 'business',
          include: [{ model: BusinessSettings, as: 'settings' }],
        },
      ],
    });
    
    if (!booking) {
      logger.warn({ bookingId: data.bookingId }, 'Booking not found for reminder');
      return;
    }
    
    // Check if reminder already sent
    const existingReminder = await BookingReminder.findOne({
      where: {
        booking_id: data.bookingId,
        reminder_type: data.reminderType,
        sent_at: { [Op.ne]: null },
      } as WhereOptions<typeof BookingReminder.prototype>,
    });
    
    if (existingReminder) {
      logger.info({ bookingId: data.bookingId }, 'Reminder already sent');
      return;
    }
    
    // Get customer email
    const customer = booking.get('customer') as Customer | undefined;
    if (!customer?.email) {
      logger.warn({ bookingId: data.bookingId }, 'Customer email not found');
      return;
    }
    
    // Determine locale (default to ja)
    const business = booking.get('business') as (Business & { settings?: BusinessSettings }) | undefined;
    const businessSettings = business?.settings;
    const locale = (businessSettings?.default_locale as 'ja' | 'en') || 'ja';
    
    // Format date/time
    const bookingDate = locale === 'ja'
      ? formatDateTimeJapanese(booking.start_at)
      : formatDateTime(booking.start_at, 'yyyy-MM-dd HH:mm', 'en');
    
    const bookingTime = formatDateTime(booking.start_at, 'HH:mm', locale);
    
    // Get service and resource
    const service = booking.get('service') as Service | undefined;
    const resource = booking.get('resource') as Resource | undefined;
    
    // Prepare email data
    const emailData = {
      to: customer.email,
      subject: locale === 'ja'
        ? `予約リマインダー - ${bookingDate}`
        : `Booking Reminder - ${bookingDate}`,
      html: '', // Will be filled by template
      locale,
      notificationId: undefined as string | undefined,
    };
    
    // Create notification outbox entry
    const notification = await NotificationOutbox.create({
      kind: 'booking_reminder',
      to_email: customer.email,
      locale,
      tone: 'polite',
      template: `booking_reminder.${locale}.html`,
      data_json: {
        customer_name: customer.name || 'Customer',
        business_name: business?.display_name_ja || business?.display_name_en || 'Business',
        service_name: service?.name_ja || service?.name_en || 'Service',
        resource_name: resource?.name || 'N/A',
        booking_date: bookingDate,
        booking_time: bookingTime,
        booking_id: booking.id,
        business_address: '', // TODO: Format address
        business_phone: business?.phone || '',
        business_email: business?.email || '',
      },
      scheduled_at: new Date(data.scheduledAt),
      delivery_status: DeliveryStatus.QUEUED,
      attempts: 0,
    });
    
    emailData.notificationId = notification.id;
    
    // Add to email queue
    await addEmailJob(emailData);
    
    // Mark reminder as sent
    await BookingReminder.update(
      { sent_at: new Date() },
      {
        where: {
          booking_id: data.bookingId,
          reminder_type: data.reminderType,
        },
      }
    );
    
    logger.info({ bookingId: data.bookingId }, 'Booking reminder sent');
  } catch (error) {
    logger.error({ error, jobId: job.id, bookingId: data.bookingId }, 'Booking reminder job failed');
    throw error;
  }
}

/**
 * Create booking reminder worker
 */
export function createBookingReminderWorker() {
  return makeWorker<BookingReminderJobData>(QUEUE_NAMES.BOOKING_REMINDER, processBookingReminderJob);
}

/**
 * Start booking reminder worker
 */
export function startBookingReminderWorker() {
  const worker = createBookingReminderWorker();
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job?.id }, 'Booking reminder job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'Booking reminder job failed');
  });
  
  worker.on('error', (err) => {
    logger.error({ error: err }, 'Booking reminder worker error');
  });
  
  logger.info('Booking reminder worker started');
  return worker;
}

