/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  listPayments,
  getPaymentById,
  processWebhook,
} from '../services/payment.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
  PaymentQueryParams,
} from '../validators/payment.validator';

/**
 * Create payment intent
 * POST /api/v1/payments/intent
 */
export async function createPaymentIntentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreatePaymentIntentRequest = req.body;
    const userId = req.user?.id;

    const result = await createPaymentIntent(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: {
        payment: result.payment,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm payment
 * POST /api/v1/payments/confirm
 */
export async function confirmPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: ConfirmPaymentRequest = req.body;
    const userId = req.user?.id;

    const payment = await confirmPayment(data, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('confirmed', locale),
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refund payment
 * POST /api/v1/payments/:id/refund
 */
export async function refundPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: RefundPaymentRequest = { ...req.body, payment_id: id };
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const payment = await refundPayment(data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('refunded', locale),
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List payments
 * GET /api/v1/payments
 */
export async function listPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as PaymentQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { payments, total, page, limit } = await listPayments(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { payments, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payment by ID
 * GET /api/v1/payments/:id
 */
export async function getPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const payment = await getPaymentById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Webhook handler
 * POST /api/v1/payments/webhook/:provider
 */
export async function webhookController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-signature'] as string | undefined;
    const eventType = req.body.type || req.body.event_type || 'unknown';
    const payload = req.body;

    if (provider !== 'stripe' && provider !== 'payjp') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payment provider',
      });
      return;
    }

    // Process webhook asynchronously
    await processWebhook(provider, eventType, payload, signature);

    // Return 200 immediately to acknowledge receipt
    res.status(200).json({
      status: 'success',
      message: 'Webhook received',
    });
  } catch (error) {
    next(error);
  }
}

