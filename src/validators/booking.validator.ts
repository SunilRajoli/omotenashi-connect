/**
 * Booking validation schemas
 * Zod schemas for booking endpoints
 */

import { z } from 'zod';
import {
  uuidSchema,
  isoDateSchema,
  optionalJsonObjectSchema,
} from '../utils/validators';
import { BookingStatus, BookingSource } from '../types/enums';

/**
 * Create booking request schema
 */
export const createBookingSchema = z.object({
  business_id: uuidSchema,
  service_id: uuidSchema.optional(),
  resource_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  start_at: isoDateSchema,
  end_at: isoDateSchema,
  metadata: optionalJsonObjectSchema,
}).refine(
  (data) => new Date(data.start_at) < new Date(data.end_at),
  {
    message: 'Start time must be before end time',
    path: ['end_at'],
  }
);

export type CreateBookingRequest = z.infer<typeof createBookingSchema>;

/**
 * Update booking request schema
 */
export const updateBookingSchema = z.object({
  start_at: isoDateSchema.optional(),
  end_at: isoDateSchema.optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  metadata: optionalJsonObjectSchema,
}).refine(
  (data) => {
    if (data.start_at && data.end_at) {
      return new Date(data.start_at) < new Date(data.end_at);
    }
    return true;
  },
  {
    message: 'Start time must be before end time',
    path: ['end_at'],
  }
);

export type UpdateBookingRequest = z.infer<typeof updateBookingSchema>;

/**
 * Cancel booking request schema
 */
export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

export type CancelBookingRequest = z.infer<typeof cancelBookingSchema>;

/**
 * Availability request schema
 */
export const availabilitySchema = z.object({
  business_id: uuidSchema,
  service_id: uuidSchema.optional(),
  resource_id: uuidSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected: YYYY-MM-DD)'),
  duration_minutes: z.number().int().positive().optional(),
});

export type AvailabilityRequest = z.infer<typeof availabilitySchema>;

/**
 * Booking query parameters schema
 */
export const bookingQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  service_id: uuidSchema.optional(),
  resource_id: uuidSchema.optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  source: z.nativeEnum(BookingSource).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type BookingQueryParams = z.infer<typeof bookingQuerySchema>;

