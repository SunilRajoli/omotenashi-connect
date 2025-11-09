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
import { env } from '../config/env';

interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  locale?: 'ja' | 'en';
  scheduledAt?: Date;
  notificationId?: string;
}

/**
 * Send email via SendGrid
 */
async function sendEmail(data: EmailJobData): Promise<void> {
  // Use SendGrid if configured, otherwise log
  if (env.SENDGRID_API_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(env.SENDGRID_API_KEY);

      await sgMail.send({
        to: data.to,
        from: {
          email: env.FROM_EMAIL,
          name: env.FROM_NAME,
        },
        subject: data.subject,
        html: data.html,
      });

      logger.info({ to: data.to, subject: data.subject }, 'Email sent via SendGrid');
    } catch (error) {
      logger.error({ error, to: data.to }, 'Failed to send email via SendGrid');
      throw error;
    }
  } else {
    // Development/test mode - just log
    logger.info(
      {
        to: data.to,
        subject: data.subject,
        htmlLength: data.html.length,
      },
      'Email would be sent (SendGrid not configured)'
    );
  }
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

