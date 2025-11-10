/**
 * LINE Validator
 * Validation schemas for LINE-related requests
 */

import { z } from 'zod';

/**
 * Link LINE account request schema
 */
export const linkLineAccountSchema = z.object({
  line_user_id: z.string().min(1),
  line_access_token: z.string().min(1).optional(),
});

export type LinkLineAccountRequest = z.infer<typeof linkLineAccountSchema>;

/**
 * Send LINE message request schema
 */
export const sendLineMessageSchema = z.object({
  line_user_id: z.string().min(1),
  message: z.string().min(1),
  message_type: z.enum(['text', 'flex']).optional().default('text'),
});

export type SendLineMessageRequest = z.infer<typeof sendLineMessageSchema>;

