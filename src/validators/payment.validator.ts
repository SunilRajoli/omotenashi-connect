import { z } from 'zod';
import { uuidSchema, optionalJsonObjectSchema } from '../utils/validators';
import { PaymentMode, PaymentStatus } from '../types/enums';

/**
 * Create payment intent request schema
 */
export const createPaymentIntentSchema = z.object({
  booking_id: uuidSchema,
  amount_cents: z.number().int().positive(),
  currency: z.string().length(3).default('JPY'),
  mode: z.nativeEnum(PaymentMode),
  metadata: optionalJsonObjectSchema,
});

export type CreatePaymentIntentRequest = z.infer<typeof createPaymentIntentSchema>;

/**
 * Confirm payment request schema
 */
export const confirmPaymentSchema = z.object({
  payment_intent_id: z.string().min(1),
  payment_method_id: z.string().optional(),
  return_url: z.string().url().optional(),
});

export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>;

/**
 * Refund payment request schema
 */
export const refundPaymentSchema = z.object({
  payment_id: uuidSchema,
  amount_cents: z.number().int().positive().optional(),
  reason: z.string().optional(),
  metadata: optionalJsonObjectSchema,
});

export type RefundPaymentRequest = z.infer<typeof refundPaymentSchema>;

/**
 * Payment query parameters schema
 */
export const paymentQuerySchema = z.object({
  booking_id: uuidSchema.optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  provider: z.enum(['stripe', 'payjp']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type PaymentQueryParams = z.infer<typeof paymentQuerySchema>;
