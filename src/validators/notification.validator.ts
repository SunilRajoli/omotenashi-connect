import { z } from 'zod';
import { uuidSchema } from '../utils/validators';
import { NotificationTone, Locale } from '../types/enums';
import { DeliveryStatus } from '../models/notificationOutbox.model';

/**
 * Create notification request schema
 */
export const createNotificationSchema = z.object({
  kind: z.string().min(1),
  to_email: z.string().email().optional(),
  to_phone: z.string().optional(),
  locale: z.nativeEnum(Locale).optional().default(Locale.JA),
  tone: z.nativeEnum(NotificationTone).optional().default(NotificationTone.POLITE),
  template: z.string().min(1),
  data_json: z.record(z.unknown()),
  scheduled_at: z.string().datetime().optional(),
});

export type CreateNotificationRequest = z.infer<typeof createNotificationSchema>;

/**
 * Update notification request schema
 */
export const updateNotificationSchema = z.object({
  delivery_status: z.nativeEnum(DeliveryStatus).optional(),
  error_message: z.string().optional(),
});

export type UpdateNotificationRequest = z.infer<typeof updateNotificationSchema>;

/**
 * Notification query parameters schema
 */
export const notificationQuerySchema = z.object({
  kind: z.string().optional(),
  to_email: z.string().email().optional(),
  delivery_status: z.nativeEnum(DeliveryStatus).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;

/**
 * Notification preferences schema
 */
export const updateNotificationPreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  booking_reminders: z.boolean().optional(),
  payment_notifications: z.boolean().optional(),
  review_requests: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
});

export type UpdateNotificationPreferencesRequest = z.infer<typeof updateNotificationPreferencesSchema>;

