/**
 * LINE Service
 * Handles LINE messaging, login, and account linking
 */

import { TextMessage } from '@line/bot-sdk';
import { lineClient } from '../config/line';
import { LineUser } from '../models/lineUser.model';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { logger } from '../utils/logger';
import { NotFoundError, BadRequestError } from '../utils/httpErrors';
import { Locale } from '../types/enums';

/**
 * Send text message to LINE user
 */
export async function sendLineMessage(
  lineUserId: string,
  message: string
): Promise<void> {
  try {
    await lineClient.pushMessage(lineUserId, {
      type: 'text',
      text: message,
    } as TextMessage);
    logger.info({ lineUserId }, 'LINE message sent');
  } catch (error) {
    logger.error({ lineUserId, error }, 'Failed to send LINE message');
    throw error;
  }
}

/**
 * Send booking confirmation message via LINE
 */
export async function sendBookingConfirmationMessage(
  userId: string,
  bookingId: string,
  locale: Locale = Locale.JA
): Promise<void> {
  try {
    // Get LINE user
    const lineUser = await LineUser.findOne({
      where: { user_id: userId },
      include: [{ model: User, as: 'user' }],
    });

    if (!lineUser || !lineUser.line_user_id) {
      logger.debug({ userId }, 'User does not have LINE account linked');
      return; // Not an error - user may not have LINE linked
    }

    // Get booking details
    const { Business } = await import('../models/business.model');
    const { Service } = await import('../models/service.model');
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
      ],
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Format booking message
    const business = (booking as unknown as { business?: { display_name_ja?: string; display_name_en?: string } }).business;
    const service = (booking as unknown as { service?: { name_ja?: string; name_en?: string } }).service;

    const businessName = locale === Locale.JA
      ? business?.display_name_ja || business?.display_name_en || 'Business'
      : business?.display_name_en || business?.display_name_ja || 'Business';

    const serviceName = locale === Locale.JA
      ? service?.name_ja || service?.name_en || 'Service'
      : service?.name_en || service?.name_ja || 'Service';

    const startDate = new Date(booking.start_at).toLocaleString(locale === Locale.JA ? 'ja-JP' : 'en-US');
    const priceSnapshot = booking.price_snapshot_json as { final_price_cents?: number } | undefined;
    const priceCents = priceSnapshot?.final_price_cents || 0;
    const price = priceCents > 0 ? `¥${(priceCents / 100).toLocaleString()}` : 'Free';

    const message = locale === Locale.JA
      ? `予約が確定しました！\n\n店舗: ${businessName}\nサービス: ${serviceName}\n日時: ${startDate}\n金額: ${price}\n\n予約ID: ${booking.id.substring(0, 8)}`
      : `Booking confirmed!\n\nBusiness: ${businessName}\nService: ${serviceName}\nDate: ${startDate}\nPrice: ${price}\n\nBooking ID: ${booking.id.substring(0, 8)}`;

    await sendLineMessage(lineUser.line_user_id, message);
    logger.info({ userId, bookingId, lineUserId: lineUser.line_user_id }, 'Booking confirmation LINE message sent');
  } catch (error) {
    logger.error({ userId, bookingId, error }, 'Failed to send booking confirmation LINE message');
    // Don't throw - LINE messaging is optional
  }
}

/**
 * Link LINE account to user
 */
export async function linkLineAccount(
  userId: string,
  lineUserId: string,
  _accessToken?: string,
  _refreshToken?: string
): Promise<LineUser> {
  // Check if LINE user already linked
  const existing = await LineUser.findOne({
    where: { line_user_id: lineUserId },
  });

  if (existing) {
    throw new BadRequestError('LINE account is already linked to another user');
  }

  // Check if user already has LINE account
  const userLineAccount = await LineUser.findOne({
    where: { user_id: userId },
  });

  if (userLineAccount) {
    throw new BadRequestError('User already has a LINE account linked');
  }

  // Get LINE user profile
  let displayName: string | undefined;
  let pictureUrl: string | undefined;
  let statusMessage: string | undefined;

  try {
    const profile = await lineClient.getProfile(lineUserId);
    displayName = profile.displayName;
    pictureUrl = profile.pictureUrl;
    statusMessage = profile.statusMessage;
  } catch (error) {
    logger.warn({ lineUserId, error }, 'Failed to get LINE user profile');
  }

  // Create LINE user record
  // Note: access_token and refresh_token are not stored in the model
  // For now, we'll just store the basic profile info
  const lineUser = await LineUser.create({
    user_id: userId,
    line_user_id: lineUserId,
    display_name: displayName,
    picture_url: pictureUrl,
    status_message: statusMessage,
  });

  logger.info({ userId, lineUserId }, 'LINE account linked');

  return lineUser;
}

/**
 * Unlink LINE account from user
 */
export async function unlinkLineAccount(userId: string): Promise<void> {
  const lineUser = await LineUser.findOne({
    where: { user_id: userId },
  });

  if (!lineUser) {
    throw new NotFoundError('LINE account not found');
  }

  await lineUser.destroy();

  logger.info({ userId }, 'LINE account unlinked');
}

/**
 * Get LINE user by user ID
 */
export async function getLineUserByUserId(userId: string): Promise<LineUser | null> {
  return LineUser.findOne({
    where: { user_id: userId },
  });
}
