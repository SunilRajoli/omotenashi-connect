/**
 * Payment validation schemas
 * Zod schemas for payment endpoints
 */

import { z } from 'zod';
import {
  uuidSchema,
  amountCentsSchema,
  optionalJsonObjectSchema,
} from '../utils/validators';
import { PaymentMode } from '../types/enums';

/**
 * Create payment request schema
 */
export const createPaymentSchema = z.object({
  booking_id: uuidSchema,
  amount_cents: amountCentsSchema,
  mode: z.nativeEnum(PaymentMode),
  provider: z.enum(['stripe', 'payjp']).optional(),
  idempotency_key: z.string().optional(),
});

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

/**
 * Payment webhook schema
 */
export const paymentWebhookSchema = z.object({
  provider: z.enum(['stripe', 'payjp']),
  event_type: z.string(),
  signature: z.string().optional(),
  payload_json: z.record(z.unknown()),
});

export type PaymentWebhookRequest = z.infer<typeof paymentWebhookSchema>;

/**
 * Refund payment request schema
 */
export const refundPaymentSchema = z.object({
  payment_id: uuidSchema,
  amount_cents: amountCentsSchema.optional(), // Partial refund if specified
  reason: z.string().optional(),
});

export type RefundPaymentRequest = z.infer<typeof refundPaymentSchema>;

/**
 * Payment query parameters schema
 */
export const paymentQuerySchema = z.object({
  booking_id: uuidSchema.optional(),
  status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
  provider: z.enum(['stripe', 'payjp']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type PaymentQueryParams = z.infer<typeof paymentQuerySchema>;

