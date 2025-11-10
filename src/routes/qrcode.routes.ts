/**
 * QR Code Routes
 * API endpoints for QR code management
 */

import { Router } from 'express';
import {
  generateQrCodeController,
  checkInQrCodeController,
  getQrCodeController,
} from '../controllers/qrcode.controller';
import { authGuard, requireStaffOrAbove } from '../middleware/authGuard';
import { validateBody, validateParams } from '../middleware/validation';
import { checkInQrCodeSchema } from '../validators/qrcode.validator';
import { z } from 'zod';

const router = Router();

/**
 * @route   GET /api/v1/bookings/:id/qr-code
 * @desc    Generate QR code for booking
 * @access  Private (Owner, Staff, Admin)
 */
router.get(
  '/bookings/:id/qr-code',
  authGuard,
  requireStaffOrAbove,
  validateParams(z.object({ id: z.string().uuid() })),
  generateQrCodeController
);

/**
 * @route   POST /api/v1/qr-codes/check-in
 * @desc    Check-in using QR code
 * @access  Private (Staff, Admin)
 */
router.post(
  '/check-in',
  authGuard,
  requireStaffOrAbove,
  validateBody(checkInQrCodeSchema),
  checkInQrCodeController
);

/**
 * @route   GET /api/v1/bookings/:id/qr-code
 * @desc    Get QR code for booking
 * @access  Private (Owner, Staff, Admin)
 */
router.get(
  '/bookings/:id/qr-code',
  authGuard,
  requireStaffOrAbove,
  validateParams(z.object({ id: z.string().uuid() })),
  getQrCodeController
);

export default router;

