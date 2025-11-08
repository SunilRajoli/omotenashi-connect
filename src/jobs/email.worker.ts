/**
 * Email worker
 * Processes email notifications from queue
 */

import { makeWorker } from '../config/bullmq';
import { QUEUE_NAMES } from './queues';
import { logger } from '../utils/logger';
import { NotificationOutbox, DeliveryStatus } from '../models/notificationOutbox.model';
import { sequelize } from '../config/sequelize';
import { Job } from 'bullmq';

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  locale?: 'ja' | 'en';
  scheduledAt?: Date;
  notificationId?: string;
}

/**
 * Send email (placeholder - integrate with SendGrid/Twilio)
 * TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
 */
async function sendEmail(data: EmailJobData): Promise<void> {
  // TODO: Replace with actual email service integration
  logger.info({ to: data.to, subject: data.subject }, 'Sending email');
  
  // Example: SendGrid integration
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: data.to,
  //   from: process.env.FROM_EMAIL,
  //   subject: data.subject,
  //   html: data.html,
  // });
  
  // For now, just log
  logger.info({ email: data.to }, 'Email sent (mock)');
}

/**
 * Email worker processor
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const data = job.data;
  
  try {
    logger.info({ jobId: job.id, to: data.to }, 'Processing email job');
    
    // Send email
    await sendEmail(data);
    
    // Update notification outbox if notificationId provided
    if (data.notificationId) {
      await NotificationOutbox.update(
        {
          sent_at: new Date(),
          delivery_status: DeliveryStatus.SENT,
          attempts: sequelize.literal('attempts + 1'),
        },
        {
          where: { id: data.notificationId },
        }
      );
    }
    
    logger.info({ jobId: job.id }, 'Email job completed');
  } catch (error) {
    logger.error({ error, jobId: job.id }, 'Email job failed');
    
    // Update notification outbox on failure
    if (data.notificationId) {
      await NotificationOutbox.update(
        {
          delivery_status: DeliveryStatus.FAILED,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          attempts: sequelize.literal('attempts + 1'),
        },
        {
          where: { id: data.notificationId },
        }
      );
    }
    
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Create email worker
 */
export function createEmailWorker() {
  return makeWorker<EmailJobData>(QUEUE_NAMES.EMAIL, processEmailJob);
}

/**
 * Start email worker
 */
export function startEmailWorker() {
  const worker = createEmailWorker();
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job?.id }, 'Email job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'Email job failed');
  });
  
  worker.on('error', (err) => {
    logger.error({ error: err }, 'Email worker error');
  });
  
  logger.info('Email worker started');
  return worker;
}

