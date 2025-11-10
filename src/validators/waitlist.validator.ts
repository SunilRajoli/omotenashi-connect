/**
 * Waitlist Validators
 * Zod schemas for waitlist request validation
 */

import { z } from 'zod';
import { WaitlistStatus, WaitlistPriority } from '../models/waitlist.model';

export const createWaitlistSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  service_id: z.string().uuid('Invalid service ID').optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  preferred_time_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  preferred_time_end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  priority: z.nativeEnum(WaitlistPriority).optional(),
  response_deadline_hours: z.number().int().min(1).max(168).optional(), // 1 hour to 1 week
});

export const updateWaitlistSchema = z.object({
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  preferred_time_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  preferred_time_end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  priority: z.nativeEnum(WaitlistPriority).optional(),
  status: z.nativeEnum(WaitlistStatus).optional(),
});

export const waitlistQuerySchema = z.object({
  business_id: z.string().uuid('Invalid business ID').optional(),
  service_id: z.string().uuid('Invalid service ID').optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  status: z.nativeEnum(WaitlistStatus).optional(),
  priority: z.nativeEnum(WaitlistPriority).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const notifyWaitlistSchema = z.object({
  date: z.string().datetime('Invalid date format').or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),
  time_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  time_end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
});

export type CreateWaitlistRequest = z.infer<typeof createWaitlistSchema>;
export type UpdateWaitlistRequest = z.infer<typeof updateWaitlistSchema>;
export type WaitlistQueryParams = z.infer<typeof waitlistQuerySchema>;
export type NotifyWaitlistRequest = z.infer<typeof notifyWaitlistSchema>;

