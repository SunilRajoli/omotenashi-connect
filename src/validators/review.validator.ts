import { z } from 'zod';
import { uuidSchema, ratingSchema } from '../utils/validators';

/**
 * Create review request schema
 */
export const createReviewSchema = z.object({
  booking_id: uuidSchema.optional(),
  business_id: uuidSchema,
  customer_id: uuidSchema.optional(),
  rating: ratingSchema,
  comment: z.string().max(5000).optional(),
});

export type CreateReviewRequest = z.infer<typeof createReviewSchema>;

/**
 * Update review request schema
 */
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  comment: z.string().max(5000).optional(),
});

export type UpdateReviewRequest = z.infer<typeof updateReviewSchema>;

/**
 * Moderate review request schema
 */
export const moderateReviewSchema = z.object({
  is_visible: z.boolean(),
  moderation_reason: z.string().optional(),
});

export type ModerateReviewRequest = z.infer<typeof moderateReviewSchema>;

/**
 * Respond to review request schema
 */
export const respondToReviewSchema = z.object({
  response_text: z.string().min(1).max(2000),
});

export type RespondToReviewRequest = z.infer<typeof respondToReviewSchema>;

/**
 * Review query parameters schema
 */
export const reviewQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  booking_id: uuidSchema.optional(),
  rating: z.number().int().min(1).max(5).optional(),
  is_visible: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type ReviewQueryParams = z.infer<typeof reviewQuerySchema>;

