/**
 * Webhook worker
 * Processes payment webhooks from Stripe/Pay.jp
 */

import { Op } from 'sequelize';
import { makeWorker } from '../config/bullmq';
import { QUEUE_NAMES } from './queues';
import { logger } from '../utils/logger';
import { PaymentWebhook } from '../models/paymentWebhook.model';
import { BookingPayment } from '../models/bookingPayment.model';
import { Booking } from '../models/booking.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import { BusinessSettings } from '../models/businessSettings.model';
import { PaymentStatus } from '../types/enums';
import { BookingStatus } from '../models/booking.model';
import { Locale } from '../types/enums';
import { paymentConfig } from '../config/payment';
import { verifyHmacSignature } from '../utils/crypto';
import { sendPaymentReceived } from '../services/email.service';
import { Job } from 'bullmq';

interface WebhookJobData {
  provider: 'stripe' | 'payjp';
  eventType: string;
  payload: Record<string, unknown>;
  signature?: string;
  retryCount?: number;
  webhookId?: string;
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  provider: 'stripe' | 'payjp',
  payload: Record<string, unknown>,
  signature?: string
): boolean {
  if (!signature) {
    logger.warn({ provider }, 'No signature provided for webhook');
    return false;
  }
  
  // TODO: Implement actual signature verification
  // For Stripe: Use stripe.webhooks.constructEvent()
  // For Pay.jp: Use HMAC verification
  
  const secret =
    provider === 'stripe'
      ? paymentConfig.stripeSecret
      : paymentConfig.payjpSecret;
  
  if (!secret) {
    logger.warn({ provider }, 'Webhook secret not configured');
    return false;
  }
  
  // Example HMAC verification (adjust based on provider)
  const payloadString = JSON.stringify(payload);
  return verifyHmacSignature(payloadString, signature, secret);
}

/**
 * Process payment webhook event
 */
async function processWebhookEvent(
  provider: 'stripe' | 'payjp',
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  logger.info({ provider, eventType }, 'Processing webhook event');
  
  // Extract payment information from payload
  // This is provider-specific and needs to be implemented based on actual webhook format
  const chargeId = payload.id as string;
  const status = payload.status as string;
  
  // Find payment by provider charge ID or intent ID
  const payment = await BookingPayment.findOne({
    where: {
      provider,
      [Op.or]: [
        { provider_charge_id: chargeId },
        { provider_intent_id: chargeId },
      ],
    },
    include: [
      {
        model: Booking,
        as: 'booking',
        include: [
          { model: Business, as: 'business' },
          { model: Service, as: 'service' },
          { model: Customer, as: 'customer' },
        ],
      },
    ],
  });

  if (!payment) {
    logger.warn({ provider, chargeId }, 'Payment not found for webhook');
    return;
  }

  // Update payment status based on webhook event
  let newStatus: PaymentStatus | null = null;

  if (eventType.includes('succeeded') || status === 'succeeded') {
    newStatus = PaymentStatus.SUCCEEDED;
  } else if (eventType.includes('failed') || status === 'failed') {
    newStatus = PaymentStatus.FAILED;
  } else if (eventType.includes('refunded') || status === 'refunded') {
    newStatus = PaymentStatus.REFUNDED;
  }

  if (newStatus && newStatus !== payment.status) {
    await payment.update({
      status: newStatus,
      raw_response: payload,
    });
    
    // Update booking status if payment succeeded
    const booking = payment.get('booking') as Booking | undefined;
    if (newStatus === PaymentStatus.SUCCEEDED && booking) {
      await booking.update({
        status: BookingStatus.CONFIRMED,
      });

      // Send payment received email
      const business = booking.get('business') as Business | undefined;
      const service = booking.get('service') as Service | undefined;
      const customer = booking.get('customer') as Customer | undefined;

      if (customer?.email && business && service) {
        try {
          const settings = await BusinessSettings.findOne({
            where: { business_id: business.id },
          });
          const locale = (settings?.default_locale as Locale) || Locale.JA;

          await sendPaymentReceived(customer.email, locale, {
            customerName: customer.name || customer.email,
            businessName: business.display_name_ja || business.display_name_en || business.slug,
            amount: payment.amount_cents / 100, // Convert cents to currency unit
            currency: payment.currency,
            paymentId: payment.id,
            bookingId: booking.id,
          });

          logger.info({ paymentId: payment.id, customerEmail: customer.email }, 'Payment received email sent via webhook');
        } catch (error) {
          logger.error({ error, paymentId: payment.id }, 'Failed to send payment received email via webhook');
        }
      }
    }
    
    logger.info(
      { paymentId: payment.id, oldStatus: payment.status, newStatus },
      'Payment status updated from webhook'
    );
  }
}

/**
 * Webhook worker processor
 */
async function processWebhookJob(job: Job<WebhookJobData>): Promise<void> {
  const data = job.data;
  
  try {
    logger.info(
      { jobId: job.id, provider: data.provider, eventType: data.eventType },
      'Processing webhook job'
    );
    
    // Verify signature
    if (!verifyWebhookSignature(data.provider, data.payload, data.signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    // Process webhook event
    await processWebhookEvent(data.provider, data.eventType, data.payload);
    
    // Update webhook record if webhookId provided
    if (data.webhookId) {
      await PaymentWebhook.update(
        {
          processed_at: new Date(),
          retry_count: data.retryCount || 0,
        },
        {
          where: { id: data.webhookId },
        }
      );
    }
    
    logger.info({ jobId: job.id }, 'Webhook job completed');
  } catch (error) {
    logger.error(
      { error, jobId: job.id, provider: data.provider },
      'Webhook job failed'
    );
    
    // Update webhook record on failure - note: PaymentWebhook doesn't have error_message field
    if (data.webhookId) {
      await PaymentWebhook.update(
        {
          retry_count: (data.retryCount || 0) + 1,
        },
        {
          where: { id: data.webhookId },
        }
      );
    }
    
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Create webhook worker
 */
export function createWebhookWorker() {
  return makeWorker<WebhookJobData>(QUEUE_NAMES.WEBHOOK, processWebhookJob);
}

/**
 * Start webhook worker
 */
export function startWebhookWorker() {
  const worker = createWebhookWorker();
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job?.id }, 'Webhook job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'Webhook job failed');
  });
  
  worker.on('error', (err) => {
    logger.error({ error: err }, 'Webhook worker error');
  });
  
  logger.info('Webhook worker started');
  return worker;
}

