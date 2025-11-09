import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create media request schema
 */
export const createMediaSchema = z.object({
  business_id: uuidSchema,
  type: z.enum(['image', 'video']),
  caption_ja: z.string().max(500).optional(),
  caption_en: z.string().max(500).optional(),
  display_order: z.number().int().nonnegative().optional().default(0),
  is_featured: z.boolean().optional().default(false),
});

export type CreateMediaRequest = z.infer<typeof createMediaSchema>;

/**
 * Update media request schema
 */
export const updateMediaSchema = z.object({
  caption_ja: z.string().max(500).optional(),
  caption_en: z.string().max(500).optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_featured: z.boolean().optional(),
});

export type UpdateMediaRequest = z.infer<typeof updateMediaSchema>;

/**
 * Media query parameters schema
 */
export const mediaQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  type: z.enum(['image', 'video']).optional(),
  is_featured: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type MediaQueryParams = z.infer<typeof mediaQuerySchema>;

