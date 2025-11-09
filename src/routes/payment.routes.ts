/**
 * Payment Routes
 * Payment processing endpoints
 */

import { Router } from 'express';
import {
  createPaymentIntentController,
  confirmPaymentController,
  refundPaymentController,
  listPaymentsController,
  getPaymentController,
  webhookController,
} from '../controllers/payment.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
  paymentQuerySchema,
} from '../validators/payment.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Payment Routes
 */

/**
 * @route   POST /api/v1/payments/intent
 * @desc    Create payment intent
 * @access  Private (Authenticated User)
 */
router.post(
  '/payments/intent',
  authGuard,
  standardRateLimit,
  validateBody(createPaymentIntentSchema),
  createPaymentIntentController
);

/**
 * @route   POST /api/v1/payments/confirm
 * @desc    Confirm payment
 * @access  Private (Authenticated User)
 */
router.post(
  '/payments/confirm',
  authGuard,
  standardRateLimit,
  validateBody(confirmPaymentSchema),
  confirmPaymentController
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Refund payment
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/payments/:id/refund',
  authGuard,
  standardRateLimit,
  validateBody(refundPaymentSchema),
  refundPaymentController
);

/**
 * @route   GET /api/v1/payments
 * @desc    List payments
 * @access  Private (Authenticated User)
 */
router.get(
  '/payments',
  authGuard,
  standardRateLimit,
  validateQuery(paymentQuerySchema),
  listPaymentsController
);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private (Authenticated User)
 */
router.get(
  '/payments/:id',
  authGuard,
  standardRateLimit,
  getPaymentController
);

/**
 * @route   POST /api/v1/payments/webhook/:provider
 * @desc    Payment webhook handler (Stripe/PayJP)
 * @access  Public (Webhook signature verification)
 */
router.post(
  '/payments/webhook/:provider',
  standardRateLimit,
  webhookController
);

export default router;

