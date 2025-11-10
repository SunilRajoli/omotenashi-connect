/**
 * Waitlist Controller
 * Handles waitlist-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createWaitlist,
  getWaitlist,
  listWaitlist,
  updateWaitlist,
  cancelWaitlist,
  notifyWaitlistEntry,
  convertWaitlistToBooking,
} from '../services/waitlist.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { Locale } from '../types/enums';
import {
  CreateWaitlistRequest,
  UpdateWaitlistRequest,
  WaitlistQueryParams,
  NotifyWaitlistRequest,
} from '../validators/waitlist.validator';

/**
 * Create waitlist entry
 * POST /api/v1/waitlist
 */
export async function createWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateWaitlistRequest = req.body;
    const userId = req.user?.id;

    const waitlist = await createWaitlist(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get waitlist entry by ID
 * GET /api/v1/waitlist/:id
 */
export async function getWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const waitlist = await getWaitlist(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('retrieved', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List waitlist entries
 * GET /api/v1/waitlist
 */
export async function listWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query: WaitlistQueryParams = req.query as unknown as WaitlistQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await listWaitlist(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('retrieved', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update waitlist entry
 * PATCH /api/v1/waitlist/:id
 */
export async function updateWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateWaitlistRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const waitlist = await updateWaitlist(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel waitlist entry
 * DELETE /api/v1/waitlist/:id
 */
export async function cancelWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const waitlist = await cancelWaitlist(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('cancelled', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Notify waitlist entry (when slot becomes available)
 * POST /api/v1/waitlist/:id/notify
 */
export async function notifyWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: NotifyWaitlistRequest = req.body;

    // Parse date
    const date = data.date.includes('T') ? new Date(data.date) : new Date(`${data.date}T00:00:00`);

    const localeEnum: Locale = locale === 'ja' ? Locale.JA : Locale.EN;
    const waitlist = await notifyWaitlistEntry(
      id,
      {
        date,
        time_start: data.time_start,
        time_end: data.time_end,
      },
      localeEnum
    );

    res.status(200).json({
      status: 'success',
      message: getMessage('waitlist.notified', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Convert waitlist entry to booking
 * POST /api/v1/waitlist/:id/convert
 */
export async function convertWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const { booking_id } = req.body as { booking_id: string };

    if (!booking_id) {
      res.status(400).json({
        status: 'error',
        message: getMessage('validation.required', locale),
      });
      return;
    }

    const waitlist = await convertWaitlistToBooking(id, booking_id);

    res.status(200).json({
      status: 'success',
      message: getMessage('waitlist.converted', locale),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

