/**
 * Payment Service
 * Handles payment processing with Stripe/PayJP integration
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import { PaymentWebhook } from '../models/paymentWebhook.model';
import { IdempotencyKey } from '../models/idempotencyKey.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { paymentConfig } from '../config/payment';
import { sendPaymentReceived } from './email.service';
import { Locale } from '../types/enums';
import { addWebhookJob } from '../jobs/queues';
import { createHash } from 'crypto';
import {
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  PaymentQueryParams,
} from '../validators/payment.validator';

/**
 * Check idempotency
 */
async function checkIdempotency(
  scope: string,
  requestData: Record<string, unknown>,
  transaction?: Transaction
): Promise<{ exists: boolean; response?: Record<string, unknown> }> {
  const requestHash = createHash('sha256').update(JSON.stringify(requestData)).digest('hex');

  const existing = await IdempotencyKey.findOne({
    where: {
      scope,
      request_hash: requestHash,
    },
    transaction,
  });

  if (existing && existing.status === 'completed') {
    return { exists: true, response: existing.response_json || undefined };
  }

  if (existing && existing.status === 'processing') {
    throw new ConflictError('Payment request is already being processed');
  }

  return { exists: false };
}

/**
 * Store idempotency key
 */
async function storeIdempotencyKey(
  scope: string,
  requestData: Record<string, unknown>,
  status: 'processing' | 'completed',
  response?: Record<string, unknown>,
  transaction?: Transaction
): Promise<void> {
  const requestHash = createHash('sha256').update(JSON.stringify(requestData)).digest('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

  await IdempotencyKey.upsert(
    {
      scope,
      request_hash: requestHash,
      status,
      response_json: response,
      expires_at: expiresAt,
    },
    { transaction }
  );
}

/**
 * Create payment intent with Stripe
 */
async function createStripePaymentIntent(
  amountCents: number,
  currency: string,
  metadata: Record<string, unknown>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    // Dynamic require to avoid compile-time dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stripe = require('stripe')(paymentConfig.stripeSecret);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error({ error, amountCents, currency }, 'Failed to create Stripe payment intent');
    throw new BadRequestError('Failed to create payment intent');
  }
}

/**
 * Create payment intent with PayJP
 */
async function createPayJPPaymentIntent(
  amountCents: number,
  currency: string,
  metadata: Record<string, unknown>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    // Dynamic require to avoid compile-time dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const payjp = require('payjp')(paymentConfig.payjpSecret);

    const charge = await payjp.charges.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata,
    });

    return {
      clientSecret: charge.id, // PayJP uses charge ID as client secret
      paymentIntentId: charge.id,
    };
  } catch (error) {
    logger.error({ error, amountCents, currency }, 'Failed to create PayJP payment intent');
    throw new BadRequestError('Failed to create payment intent');
  }
}

/**
 * Create payment intent
 */
export async function createPaymentIntent(
  data: CreatePaymentIntentRequest,
  userId?: string
): Promise<{ payment: BookingPayment; clientSecret: string; paymentIntentId: string }> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Check idempotency
    const idempotencyCheck = await checkIdempotency('payment_intent', data, transaction);
    if (idempotencyCheck.exists && idempotencyCheck.response) {
      const payment = await BookingPayment.findByPk(
        idempotencyCheck.response.paymentId as string,
        { transaction }
      );
      if (payment) {
        return {
          payment,
          clientSecret: idempotencyCheck.response.clientSecret as string,
          paymentIntentId: idempotencyCheck.response.paymentIntentId as string,
        };
      }
    }

    // Verify booking exists
    const booking = await Booking.findByPk(data.booking_id, {
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });

    if (!booking || booking.deleted_at) {
      throw new NotFoundError('Booking not found');
    }

    // Access control
    if (userId) {
      const business = booking.get('business') as Business | undefined;
      if (business && business.owner_id !== userId) {
        // Check if user is the customer
        const customer = booking.get('customer') as Customer | undefined;
        if (!customer || customer.user_id !== userId) {
          throw new ForbiddenError('You can only create payments for your own bookings');
        }
      }
    }

    // Verify booking status
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestError('Booking is not in pending payment status');
    }

    // Verify amount matches booking price
    const priceSnapshot = booking.price_snapshot_json as { price_cents?: number } | undefined;
    const expectedAmount = priceSnapshot?.price_cents || 0;

    if (data.amount_cents !== expectedAmount && expectedAmount > 0) {
      throw new BadRequestError('Payment amount does not match booking price');
    }

    // Check for existing pending payment
    const existingPayment = await BookingPayment.findOne({
      where: {
        booking_id: data.booking_id,
        status: PaymentStatus.PENDING,
      },
      transaction,
    });

    if (existingPayment) {
      throw new ConflictError('A pending payment already exists for this booking');
    }

    // Store idempotency key as processing
    await storeIdempotencyKey('payment_intent', data, 'processing', undefined, transaction);

    // Create payment intent with provider
    let clientSecret: string;
    let paymentIntentId: string;

    const metadata = {
      booking_id: data.booking_id,
      user_id: userId || '',
      ...data.metadata,
    };

    if (paymentConfig.provider === 'stripe') {
      const result = await createStripePaymentIntent(
        data.amount_cents,
        data.currency,
        metadata
      );
      clientSecret = result.clientSecret;
      paymentIntentId = result.paymentIntentId;
    } else {
      // PayJP
      const result = await createPayJPPaymentIntent(
        data.amount_cents,
        data.currency,
        metadata
      );
      clientSecret = result.clientSecret;
      paymentIntentId = result.paymentIntentId;
    }

    // Create payment record
    const payment = await BookingPayment.create(
      {
        booking_id: data.booking_id,
        provider: paymentConfig.provider,
        provider_intent_id: paymentIntentId,
        amount_cents: data.amount_cents,
        currency: data.currency,
        mode: data.mode,
        status: PaymentStatus.PENDING,
        raw_response: { paymentIntentId, clientSecret },
      },
      { transaction }
    );

    // Update idempotency key as completed
    await storeIdempotencyKey(
      'payment_intent',
      data,
      'completed',
      {
        paymentId: payment.id,
        clientSecret,
        paymentIntentId,
      },
      transaction
    );

    logger.info({ paymentId: payment.id, bookingId: data.booking_id }, 'Payment intent created');

    return { payment, clientSecret, paymentIntentId };
  });
}

/**
 * Confirm payment
 */
export async function confirmPayment(
  data: ConfirmPaymentRequest,
  userId?: string
): Promise<BookingPayment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Find payment by intent ID
    const payment = await BookingPayment.findOne({
      where: {
        provider_intent_id: data.payment_intent_id,
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
      transaction,
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Access control
    if (userId) {
      const booking = payment.get('booking') as Booking | undefined;
      if (booking) {
        const business = booking.get('business') as Business | undefined;
        if (business && business.owner_id !== userId) {
          const customer = booking.get('customer') as Customer | undefined;
          if (!customer || customer.user_id !== userId) {
            throw new ForbiddenError('You can only confirm payments for your own bookings');
          }
        }
      }
    }

    // Verify payment status
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestError(`Payment is already ${payment.status}`);
    }

    // Verify payment with provider
    let verified = false;
    let providerChargeId: string | undefined;

    if (payment.provider === 'stripe') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const stripe = require('stripe')(paymentConfig.stripeSecret);
        const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent_id);

        if (paymentIntent.status === 'succeeded') {
          verified = true;
          providerChargeId = paymentIntent.latest_charge as string;
        }
      } catch (error) {
        logger.error({ error, paymentIntentId: data.payment_intent_id }, 'Failed to verify Stripe payment');
        throw new BadRequestError('Failed to verify payment');
      }
    } else {
      // PayJP
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const payjp = require('payjp')(paymentConfig.payjpSecret);
        const charge = await payjp.charges.retrieve(data.payment_intent_id);

        if (charge.paid && charge.status === 'successful') {
          verified = true;
          providerChargeId = charge.id;
        }
      } catch (error) {
        logger.error({ error, chargeId: data.payment_intent_id }, 'Failed to verify PayJP payment');
        throw new BadRequestError('Failed to verify payment');
      }
    }

    if (!verified) {
      throw new BadRequestError('Payment verification failed');
    }

    // Update payment status
    await payment.update(
      {
        status: PaymentStatus.SUCCEEDED,
        provider_charge_id: providerChargeId,
        raw_response: {
          ...payment.raw_response,
          confirmed_at: new Date().toISOString(),
          provider_charge_id: providerChargeId,
        },
      },
      { transaction }
    );

    // Update booking status
    const booking = payment.get('booking') as Booking | undefined;
    if (booking) {
      await booking.update(
        {
          status: BookingStatus.CONFIRMED,
        },
        { transaction }
      );

      // Send payment received email
      const business = booking.get('business') as Business | undefined;
      const service = booking.get('service') as Service | undefined;
      const customer = booking.get('customer') as Customer | undefined;

      if (customer?.email && business && service) {
        try {
          const settings = await import('../models/businessSettings.model').then((m) =>
            m.BusinessSettings.findOne({
              where: { business_id: business.id },
            })
          );
          const locale = (settings?.default_locale as Locale) || Locale.JA;

          await sendPaymentReceived(customer.email, locale, {
            customerName: customer.name || customer.email,
            businessName: business.display_name_ja || business.display_name_en || business.slug,
            amount: payment.amount_cents / 100, // Convert cents to currency unit
            currency: payment.currency,
            paymentId: payment.id,
            bookingId: booking.id,
          });
        } catch (error) {
          logger.error({ error, paymentId: payment.id }, 'Failed to send payment received email');
        }
      }
    }

    logger.info({ paymentId: payment.id }, 'Payment confirmed');

    return payment.reload({ transaction });
  });
}

/**
 * Refund payment
 */
export async function refundPayment(
  data: RefundPaymentRequest,
  userId: string,
  userRole: string
): Promise<BookingPayment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Find payment
    const payment = await BookingPayment.findByPk(data.payment_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [{ model: Business, as: 'business' }],
        },
      ],
      transaction,
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Access control - only owners and admins can refund
    if (userRole !== 'admin' && userRole !== 'owner') {
      throw new ForbiddenError('Only owners and admins can refund payments');
    }

    const booking = payment.get('booking') as Booking | undefined;
    if (booking) {
      const business = booking.get('business') as Business | undefined;
      if (business && business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only refund payments for your own businesses');
      }
    }

    // Verify payment status
    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestError('Only succeeded payments can be refunded');
    }

    // Verify refund amount
    const refundAmount = data.amount_cents || payment.amount_cents;
    if (refundAmount > payment.amount_cents) {
      throw new BadRequestError('Refund amount cannot exceed payment amount');
    }

    // Process refund with provider
    let refundId: string | undefined;

    if (payment.provider === 'stripe') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const stripe = require('stripe')(paymentConfig.stripeSecret);
        const refund = await stripe.refunds.create({
          charge: payment.provider_charge_id,
          amount: refundAmount,
          metadata: data.metadata,
        });
        refundId = refund.id;
      } catch (error) {
        logger.error({ error, paymentId: payment.id }, 'Failed to process Stripe refund');
        throw new BadRequestError('Failed to process refund');
      }
    } else {
      // PayJP
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const payjp = require('payjp')(paymentConfig.payjpSecret);
        const refund = await payjp.refunds.create({
          charge: payment.provider_charge_id,
          amount: refundAmount,
        });
        refundId = refund.id;
      } catch (error) {
        logger.error({ error, paymentId: payment.id }, 'Failed to process PayJP refund');
        throw new BadRequestError('Failed to process refund');
      }
    }

    // Update payment status
    const newStatus =
      refundAmount === payment.amount_cents ? PaymentStatus.REFUNDED : PaymentStatus.SUCCEEDED;

    await payment.update(
      {
        status: newStatus,
        raw_response: {
          ...payment.raw_response,
          refund_id: refundId,
          refund_amount: refundAmount,
          refunded_at: new Date().toISOString(),
          refund_reason: data.reason,
        },
      },
      { transaction }
    );

    logger.info({ paymentId: payment.id, refundAmount }, 'Payment refunded');

    return payment.reload({ transaction });
  });
}

/**
 * List payments
 */
export async function listPayments(
  query: PaymentQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ payments: BookingPayment[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.booking_id) {
    where.booking_id = query.booking_id;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.provider) {
    where.provider = query.provider;
  }

  // Access control
  if (userRole === 'customer' && userId) {
    // Customers can only see payments for their bookings
    const customer = await import('../models/customer.model').then((m) =>
      m.Customer.findOne({
        where: {
          user_id: userId,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
      })
    );

    if (customer) {
      const bookings = await Booking.findAll({
        where: {
          customer_id: customer.id,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        attributes: ['id'],
      });

      const bookingIds = bookings.map((b) => b.id);
      if (bookingIds.length === 0) {
        return { payments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
      }

      where.booking_id = { [Op.in]: bookingIds };
    } else {
      return { payments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  if (userRole === 'owner' && userId) {
    // Owners can only see payments for their businesses
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { payments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    const bookings = await Booking.findAll({
      where: {
        business_id: { [Op.in]: businessIds },
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const bookingIds = bookings.map((b) => b.id);
    if (bookingIds.length === 0) {
      return { payments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    where.booking_id = { [Op.in]: bookingIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await BookingPayment.findAndCountAll({
    where,
    include: [
      {
        model: Booking,
        as: 'booking',
        attributes: ['id', 'start_at', 'end_at', 'status'],
        include: [
          { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en'] },
          { model: Service, as: 'service', attributes: ['id', 'name_ja', 'name_en'] },
        ],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    payments: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get payment by ID
 */
export async function getPaymentById(
  paymentId: string,
  userId?: string,
  userRole?: string
): Promise<BookingPayment> {
  const payment = await BookingPayment.findByPk(paymentId, {
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
    throw new NotFoundError('Payment not found');
  }

  // Access control
  if (userRole === 'customer' && userId) {
    const booking = payment.get('booking') as Booking | undefined;
    if (booking) {
      const customer = booking.get('customer') as Customer | undefined;
      if (!customer || customer.user_id !== userId) {
        throw new ForbiddenError('You can only view your own payments');
      }
    }
  }

  if (userRole === 'owner' && userId) {
    const booking = payment.get('booking') as Booking | undefined;
    if (booking) {
      const business = booking.get('business') as Business | undefined;
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('You can only view payments for your businesses');
      }
    }
  }

  return payment;
}

/**
 * Process webhook
 */
export async function processWebhook(
  provider: 'stripe' | 'payjp',
  eventType: string,
  payload: Record<string, unknown>,
  signature?: string
): Promise<void> {
  // Store webhook for processing
  const webhook = await PaymentWebhook.create({
    provider,
    event_type: eventType,
    signature,
    payload_json: payload,
    retry_count: 0,
  });

  // Queue webhook job
  await addWebhookJob({
    provider,
    eventType,
    payload,
    signature,
    webhookId: webhook.id,
  });

  logger.info({ webhookId: webhook.id, provider, eventType }, 'Webhook queued for processing');
}
