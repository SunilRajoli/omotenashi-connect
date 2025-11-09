import { z } from 'zod';
import { uuidSchema } from '../utils/validators';
import { BusinessStatus, VerificationStatus } from '../types/enums';

/**
 * Approve business request schema
 */
export const approveBusinessSchema = z.object({
  business_id: uuidSchema,
  notes: z.string().optional(),
});

export type ApproveBusinessRequest = z.infer<typeof approveBusinessSchema>;

/**
 * Reject business request schema
 */
export const rejectBusinessSchema = z.object({
  business_id: uuidSchema,
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().optional(),
});

export type RejectBusinessRequest = z.infer<typeof rejectBusinessSchema>;

/**
 * Suspend business request schema
 */
export const suspendBusinessSchema = z.object({
  business_id: uuidSchema,
  reason: z.string().min(1, 'Suspension reason is required'),
  notes: z.string().optional(),
});

export type SuspendBusinessRequest = z.infer<typeof suspendBusinessSchema>;

/**
 * Update verification status schema
 */
export const updateVerificationSchema = z.object({
  verification_id: uuidSchema,
  status: z.nativeEnum(VerificationStatus),
  notes: z.string().optional(),
});

export type UpdateVerificationRequest = z.infer<typeof updateVerificationSchema>;

/**
 * Admin business query parameters schema
 */
export const adminBusinessQuerySchema = z.object({
  status: z.nativeEnum(BusinessStatus).optional(),
  onboarding_status: z.string().optional(),
  vertical_id: uuidSchema.optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type AdminBusinessQueryParams = z.infer<typeof adminBusinessQuerySchema>;

