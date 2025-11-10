/**
 * QR Code Validator
 * Validation schemas for QR code-related requests
 */

import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Check-in with QR code request schema
 */
export const checkInQrCodeSchema = z.object({
  qr_code: z.string().min(1),
});

export type CheckInQrCodeRequest = z.infer<typeof checkInQrCodeSchema>;

/**
 * Get QR code request schema
 */
export const getQrCodeSchema = z.object({
  booking_id: uuidSchema,
});

export type GetQrCodeRequest = z.infer<typeof getQrCodeSchema>;

