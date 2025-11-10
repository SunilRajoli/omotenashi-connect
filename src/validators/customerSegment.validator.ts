/**
 * Customer Segment Validators
 * Zod schemas for customer segment validation
 */

import { z } from 'zod';
import { SegmentStatus } from '../models/customerSegment.model';

export const segmentFilterRulesSchema = z.object({
  tags: z.object({
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
  booking_count: z.object({
    operator: z.enum(['gte', 'lte', 'eq', 'gt', 'lt']),
    value: z.number().int().nonnegative(),
  }).optional(),
  total_spent: z.object({
    operator: z.enum(['gte', 'lte', 'eq', 'gt', 'lt']),
    value_cents: z.number().int().nonnegative(),
  }).optional(),
  last_visit: z.object({
    operator: z.enum(['gte', 'lte', 'before', 'after']),
    days: z.number().int().positive(),
  }).optional(),
  no_show_count: z.object({
    operator: z.enum(['gte', 'lte', 'eq', 'gt', 'lt']),
    value: z.number().int().nonnegative(),
  }).optional(),
  has_membership: z.boolean().optional(),
  created_since: z.object({
    days: z.number().int().positive(),
  }).optional(),
});

export const createSegmentSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filter_rules: segmentFilterRulesSchema,
});

export const updateSegmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  filter_rules: segmentFilterRulesSchema.optional(),
  status: z.nativeEnum(SegmentStatus).optional(),
});

export const segmentQuerySchema = z.object({
  business_id: z.string().uuid().optional(),
  status: z.nativeEnum(SegmentStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateSegmentRequest = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentRequest = z.infer<typeof updateSegmentSchema>;
export type SegmentQueryParams = z.infer<typeof segmentQuerySchema>;
export type SegmentFilterRules = z.infer<typeof segmentFilterRulesSchema>;

