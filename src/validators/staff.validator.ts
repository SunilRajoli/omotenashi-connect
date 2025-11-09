import { z } from 'zod';
import { uuidSchema } from '../utils/validators';
import { StaffRole } from '../types/enums';

/**
 * Create staff assignment request schema
 */
export const createStaffAssignmentSchema = z.object({
  user_id: uuidSchema,
  business_id: uuidSchema,
  role: z.nativeEnum(StaffRole),
  permissions_json: z.record(z.unknown()).optional().default({}),
});

export type CreateStaffAssignmentRequest = z.infer<typeof createStaffAssignmentSchema>;

/**
 * Update staff assignment request schema
 */
export const updateStaffAssignmentSchema = z.object({
  role: z.nativeEnum(StaffRole).optional(),
  permissions_json: z.record(z.unknown()).optional(),
});

export type UpdateStaffAssignmentRequest = z.infer<typeof updateStaffAssignmentSchema>;

/**
 * Staff assignment query parameters schema
 */
export const staffAssignmentQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  user_id: uuidSchema.optional(),
  role: z.nativeEnum(StaffRole).optional(),
  active_only: z.boolean().optional().default(true),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type StaffAssignmentQueryParams = z.infer<typeof staffAssignmentQuerySchema>;

/**
 * Create staff working hours request schema
 */
export const createStaffWorkingHoursSchema = z.object({
  resource_id: uuidSchema,
  working_hours: z.array(
    z.object({
      day_of_week: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
      start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
      end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    })
  ),
});

export type CreateStaffWorkingHoursRequest = z.infer<typeof createStaffWorkingHoursSchema>;

/**
 * Create staff exception request schema
 */
export const createStaffExceptionSchema = z.object({
  resource_id: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  is_working: z.boolean().default(false),
  note: z.string().max(500).optional(),
});

export type CreateStaffExceptionRequest = z.infer<typeof createStaffExceptionSchema>;

/**
 * Update staff exception request schema
 */
export const updateStaffExceptionSchema = z.object({
  is_working: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

export type UpdateStaffExceptionRequest = z.infer<typeof updateStaffExceptionSchema>;

/**
 * Staff exception query parameters schema
 */
export const staffExceptionQuerySchema = z.object({
  resource_id: uuidSchema.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type StaffExceptionQueryParams = z.infer<typeof staffExceptionQuerySchema>;

/**
 * Assign staff to booking request schema
 */
export const assignStaffToBookingSchema = z.object({
  booking_id: uuidSchema,
  resource_id: uuidSchema,
});

export type AssignStaffToBookingRequest = z.infer<typeof assignStaffToBookingSchema>;

