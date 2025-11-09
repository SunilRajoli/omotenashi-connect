import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create cancellation policy request schema
 */
export const createPolicySchema = z.object({
  business_id: uuidSchema,
  name: z.string().min(1).max(200),
  hours_before: z.number().int().nonnegative(),
  penalty_percent: z.number().int().min(0).max(100),
  is_default: z.boolean().optional().default(false),
});

export type CreatePolicyRequest = z.infer<typeof createPolicySchema>;

/**
 * Update cancellation policy request schema
 */
export const updatePolicySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  hours_before: z.number().int().nonnegative().optional(),
  penalty_percent: z.number().int().min(0).max(100).optional(),
  is_default: z.boolean().optional(),
});

export type UpdatePolicyRequest = z.infer<typeof updatePolicySchema>;

/**
 * Policy query parameters schema
 */
export const policyQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  is_default: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type PolicyQueryParams = z.infer<typeof policyQuerySchema>;

