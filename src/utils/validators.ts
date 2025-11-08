/**
 * Common validation utilities
 * Reusable Zod schemas and validators
 */

import { z } from 'zod';
import { isValidPostalCode, isValidPhoneNumber } from './jp-address';

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Password validation
 * Requirements: min 8 chars, at least one letter and one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Japanese postal code validation
 */
export const postalCodeSchema = z
  .string()
  .refine(isValidPostalCode, 'Invalid postal code format (expected: XXX-XXXX)');

/**
 * Japanese phone number validation
 */
export const phoneSchema = z
  .string()
  .refine(isValidPhoneNumber, 'Invalid phone number format');

/**
 * ISO 8601 date string validation
 */
export const isoDateSchema = z.string().datetime('Invalid ISO 8601 date format');

/**
 * Date string validation (YYYY-MM-DD)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected: YYYY-MM-DD)');

/**
 * Time string validation (HH:mm)
 */
export const timeStringSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected: HH:mm)');

/**
 * Positive integer validation
 */
export const positiveIntSchema = z.number().int().positive();

/**
 * Non-negative integer validation
 */
export const nonNegativeIntSchema = z.number().int().nonnegative();

/**
 * Currency amount in cents (positive integer)
 */
export const amountCentsSchema = z.number().int().positive().max(999999999);

/**
 * Rating validation (1-5)
 */
export const ratingSchema = z.number().int().min(1).max(5);

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z.number().int().min(0).max(100);

/**
 * Slug validation (alphanumeric, hyphens, underscores)
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9_-]+$/, 'Invalid slug format (only lowercase letters, numbers, hyphens, underscores)');

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Locale validation
 */
export const localeSchema = z.enum(['ja', 'en']);

/**
 * Timezone validation
 */
export const timezoneSchema = z.string().default('Asia/Tokyo');

/**
 * JSON object validation
 */
export const jsonObjectSchema = z.record(z.unknown());

/**
 * Optional JSON object validation
 */
export const optionalJsonObjectSchema = jsonObjectSchema.optional().default({});

/**
 * Validate and parse date string
 */
export function parseDateString(dateString: string): Date {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return parsed;
}

/**
 * Validate date range
 */
export function validateDateRange(start: Date, end: Date): void {
  if (start >= end) {
    throw new Error('Start date must be before end date');
  }
}

/**
 * Validate time range
 */
export function validateTimeRange(start: string, end: string): void {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes >= endMinutes) {
    throw new Error('Start time must be before end time');
  }
}

