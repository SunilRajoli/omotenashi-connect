/**
 * Deposit Validator
 * Validation schemas for deposit-related requests
 */

import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create deposit payment request schema
 */
export const createDepositPaymentSchema = z.object({
  booking_id: uuidSchema,
  amount_cents: z.number().int().positive().optional(),
  payment_method: z.string().min(1).optional(),
});

export type CreateDepositPaymentRequest = z.infer<typeof createDepositPaymentSchema>;

/**
 * Pay balance request schema
 */
export const payBalanceSchema = z.object({
  booking_id: uuidSchema,
  payment_method: z.string().min(1).optional(),
});

export type PayBalanceRequest = z.infer<typeof payBalanceSchema>;

