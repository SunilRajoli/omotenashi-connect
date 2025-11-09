import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create feature flag request schema
 */
export const createFeatureFlagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_enabled: z.boolean().optional().default(false),
  rollout_percent: z.number().int().min(0).max(100).optional().default(0),
  target_user_ids: z.array(uuidSchema).optional().default([]),
  target_business_ids: z.array(uuidSchema).optional().default([]),
});

export type CreateFeatureFlagRequest = z.infer<typeof createFeatureFlagSchema>;

/**
 * Update feature flag request schema
 */
export const updateFeatureFlagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  is_enabled: z.boolean().optional(),
  rollout_percent: z.number().int().min(0).max(100).optional(),
  target_user_ids: z.array(uuidSchema).optional(),
  target_business_ids: z.array(uuidSchema).optional(),
});

export type UpdateFeatureFlagRequest = z.infer<typeof updateFeatureFlagSchema>;

/**
 * Feature flag query parameters schema
 */
export const featureFlagQuerySchema = z.object({
  is_enabled: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type FeatureFlagQueryParams = z.infer<typeof featureFlagQuerySchema>;

