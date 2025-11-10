/**
 * Group Booking Validator
 * Validation schemas for group booking requests
 */

import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create group booking request schema
 */
export const createGroupBookingSchema = z.object({
  business_id: uuidSchema,
  service_id: uuidSchema.optional(),
  organizer_customer_id: uuidSchema,
  group_name: z.string().min(1).max(255).optional(),
  min_participants: z.number().int().positive().min(1),
  max_participants: z.number().int().positive().min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  total_amount_cents: z.number().int().positive(),
  payment_split_type: z.enum(['organizer_pays', 'split_equal', 'individual']),
  participant_ids: z.array(uuidSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine((data) => data.min_participants <= data.max_participants, {
  message: 'Minimum participants cannot exceed maximum participants',
  path: ['min_participants'],
}).refine((data) => new Date(data.end_at) > new Date(data.start_at), {
  message: 'End date must be after start date',
  path: ['end_at'],
});

export type CreateGroupBookingRequest = z.infer<typeof createGroupBookingSchema>;

/**
 * Update group booking request schema
 */
export const updateGroupBookingSchema = z.object({
  group_name: z.string().min(1).max(255).optional(),
  min_participants: z.number().int().positive().min(1).optional(),
  max_participants: z.number().int().positive().min(1).optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  total_amount_cents: z.number().int().positive().optional(),
  payment_split_type: z.enum(['organizer_pays', 'split_equal', 'individual']).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateGroupBookingRequest = z.infer<typeof updateGroupBookingSchema>;

/**
 * Add participant request schema
 */
export const addParticipantSchema = z.object({
  customer_id: uuidSchema,
});

export type AddParticipantRequest = z.infer<typeof addParticipantSchema>;

/**
 * Group booking query parameters schema
 */
export const groupBookingQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  service_id: uuidSchema.optional(),
  organizer_customer_id: uuidSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type GroupBookingQueryParams = z.infer<typeof groupBookingQuerySchema>;

/**
 * Record participant payment request schema
 */
export const recordParticipantPaymentSchema = z.object({
  payment_id: uuidSchema,
  amount_cents: z.number().int().positive(),
});

export type RecordParticipantPaymentRequest = z.infer<typeof recordParticipantPaymentSchema>;

