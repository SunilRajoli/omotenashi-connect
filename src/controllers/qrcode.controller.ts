/**
 * QR Code Controller
 * Handles QR code-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  generateBookingQrCode,
  checkInWithQrCode,
  getBookingQrCode,
} from '../services/qrcode.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { CheckInQrCodeRequest } from '../validators/qrcode.validator';
import { BadRequestError, NotFoundError } from '../utils/httpErrors';

/**
 * Generate QR code for booking
 * GET /api/v1/bookings/:id/qr-code
 */
export async function generateQrCodeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    const result = await generateBookingQrCode(id);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('qr_code_generated', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check-in using QR code
 * POST /api/v1/qr-codes/check-in
 */
export async function checkInQrCodeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { qr_code } = req.body as CheckInQrCodeRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const result = await checkInWithQrCode(qr_code, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('check_in_success', locale),
      data: {
        booking: result.booking,
        qr_code: {
          id: result.qrCode.id,
          status: result.qrCode.status,
          used_at: result.qrCode.used_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get QR code for booking
 * GET /api/v1/bookings/:id/qr-code
 */
export async function getQrCodeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    const result = await getBookingQrCode(id);

    if (!result) {
      throw new NotFoundError('QR code not found');
    }

    res.status(200).json({
      status: 'success',
      message: getMessage('qr_code_retrieved', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

