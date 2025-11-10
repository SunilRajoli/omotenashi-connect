/**
 * Customer Tag Validators
 * Zod schemas for customer tag validation
 */

import { z } from 'zod';
import { TagCategory } from '../models/customerTag.model';

export const createTagSchema = z.object({
  business_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  tag_name: z.string().min(1).max(100),
  category: z.nativeEnum(TagCategory).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(500).optional(),
});

export const tagQuerySchema = z.object({
  business_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  tag_name: z.string().optional(),
  tag_type: z.enum(['manual', 'auto']).optional(),
  category: z.nativeEnum(TagCategory).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const autoTagRuleSchema = z.object({
  type: z.enum(['booking_count', 'total_spent', 'last_visit', 'no_show_count', 'membership', 'custom']),
  operator: z.enum(['gte', 'lte', 'eq', 'gt', 'lt']),
  value: z.union([z.number(), z.string(), z.coerce.date()]),
  category: z.nativeEnum(TagCategory).optional(),
});

export const processAutoTaggingSchema = z.object({
  rules: z.array(autoTagRuleSchema).min(1),
});

export type CreateTagRequest = z.infer<typeof createTagSchema>;
export type TagQueryParams = z.infer<typeof tagQuerySchema>;

