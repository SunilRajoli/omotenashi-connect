/**
 * Pricing Validator
 * Validation schemas for pricing rule requests
 */

import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create pricing rule request schema
 */
export const createPricingRuleSchema = z.object({
  service_id: uuidSchema,
  name: z.string().min(1).max(255),
  day_of_week: z.array(z.number().int().min(0).max(6)).optional(),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format').optional(),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format').optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  price_modifier: z.number().int(),
  modifier_type: z.enum(['percentage', 'fixed']),
  priority: z.number().int().min(1).max(4).optional().default(2),
  metadata: z.record(z.unknown()).optional(),
});

export type CreatePricingRuleRequest = z.infer<typeof createPricingRuleSchema>;

/**
 * Update pricing rule request schema
 */
export const updatePricingRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  day_of_week: z.array(z.number().int().min(0).max(6)).optional(),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format').optional(),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format').optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  price_modifier: z.number().int().optional(),
  modifier_type: z.enum(['percentage', 'fixed']).optional(),
  priority: z.number().int().min(1).max(4).optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdatePricingRuleRequest = z.infer<typeof updatePricingRuleSchema>;

/**
 * Price preview request schema
 */
export const pricePreviewSchema = z.object({
  service_id: uuidSchema,
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  booking_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
});

export type PricePreviewRequest = z.infer<typeof pricePreviewSchema>;

