/**
 * QR Code Service
 * Handles QR code generation and validation for bookings
 */

import QRCode from 'qrcode';
import { createHash } from 'crypto';
import { Op } from 'sequelize';
import { BookingQrCode, QrCodeStatus } from '../models/bookingQrCode.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { NotFoundError, BadRequestError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

/**
 * Generate QR code for booking
 */
export async function generateBookingQrCode(bookingId: string): Promise<{
  qrCode: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
}> {
  // Verify booking exists
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check if QR code already exists
  const existing = await BookingQrCode.findOne({
    where: { booking_id: bookingId, status: QrCodeStatus.ACTIVE },
  });

  if (existing) {
    // Generate data URL from existing QR code
    const qrCodeDataUrl = await QRCode.toDataURL(existing.qr_code);
    return {
      qrCode: existing.qr_code,
      qrCodeDataUrl,
      expiresAt: existing.expires_at,
    };
  }

  // Generate unique QR code string
  const qrCodeString = `${bookingId}:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  const qrCodeHash = createHash('sha256').update(qrCodeString).digest('hex');

  // Set expiration (24 hours after booking end time)
  const expiresAt = new Date(booking.end_at);
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Create QR code record
  const qrCode = await BookingQrCode.create({
    booking_id: bookingId,
    qr_code: qrCodeString,
    qr_code_hash: qrCodeHash,
    expires_at: expiresAt,
    status: QrCodeStatus.ACTIVE,
  });

  // Generate QR code image
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeString, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  logger.info({ bookingId, qrCodeId: qrCode.id }, 'QR code generated');

  return {
    qrCode: qrCodeString,
    qrCodeDataUrl,
    expiresAt,
  };
}

/**
 * Validate and check-in using QR code
 */
export async function checkInWithQrCode(
  qrCodeString: string,
  staffUserId: string
): Promise<{
  booking: Booking;
  qrCode: BookingQrCode;
}> {
  // Find QR code
  const qrCode = await BookingQrCode.findOne({
    where: { qr_code: qrCodeString },
    include: [{ model: Booking, as: 'booking' }],
  });

  if (!qrCode) {
    throw new NotFoundError('Invalid QR code');
  }

  // Check if QR code is active
  if (qrCode.status !== QrCodeStatus.ACTIVE) {
    throw new BadRequestError(`QR code is ${qrCode.status}`);
  }

  // Check if QR code is expired
  if (new Date() > qrCode.expires_at) {
    await qrCode.update({ status: QrCodeStatus.EXPIRED });
    throw new BadRequestError('QR code has expired');
  }

  // Get booking
  const booking = await Booking.findByPk(qrCode.booking_id);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Check if booking is in valid status for check-in
  if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
    throw new BadRequestError(`Booking is ${booking.status}, cannot check in`);
  }

  // Check if booking time is valid (within 30 minutes before start time)
  const now = new Date();
  const bookingStart = new Date(booking.start_at);
  const checkInWindow = new Date(bookingStart);
  checkInWindow.setMinutes(checkInWindow.getMinutes() - 30);

  if (now < checkInWindow) {
    throw new BadRequestError('Check-in is only available 30 minutes before booking time');
  }

  if (now > new Date(booking.end_at)) {
    throw new BadRequestError('Booking time has passed');
  }

  // Update QR code status
  await qrCode.update({
    status: QrCodeStatus.USED,
    used_at: new Date(),
    used_by: staffUserId,
  });

  // Update booking status to in-progress (if confirmed)
  if (booking.status === BookingStatus.CONFIRMED) {
    // Note: We might need to add IN_PROGRESS status to BookingStatus enum
    // For now, we'll keep it as CONFIRMED
    logger.info({ bookingId: booking.id }, 'Booking checked in');
  }

  logger.info({ bookingId: booking.id, qrCodeId: qrCode.id, staffUserId }, 'Check-in completed');

  return {
    booking,
    qrCode,
  };
}

/**
 * Get QR code for booking
 */
export async function getBookingQrCode(bookingId: string): Promise<{
  qrCode: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
  status: QrCodeStatus;
} | null> {
  const qrCode = await BookingQrCode.findOne({
    where: { booking_id: bookingId },
    order: [['created_at', 'DESC']],
  });

  if (!qrCode) {
    return null;
  }

  // Generate data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrCode.qr_code, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  return {
    qrCode: qrCode.qr_code,
    qrCodeDataUrl,
    expiresAt: qrCode.expires_at,
    status: qrCode.status,
  };
}

/**
 * Expire old QR codes
 */
export async function expireOldQrCodes(): Promise<number> {
  const now = new Date();
  const result = await BookingQrCode.update(
    { status: QrCodeStatus.EXPIRED },
    {
      where: {
        status: QrCodeStatus.ACTIVE,
        expires_at: { [Op.lt]: now },
      },
    }
  );

  logger.info({ expiredCount: result[0] }, 'Expired old QR codes');

  return result[0];
}

