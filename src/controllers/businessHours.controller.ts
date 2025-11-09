/**
 * Business Hours Controller
 * HTTP handlers for business hours endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  updateBusinessHours,
  getBusinessHours,
} from '../services/businessHours.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

/**
 * Update business hours
 * PUT /api/v1/owner/businesses/:id/hours
 */
export async function updateBusinessHoursController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const hours = await updateBusinessHours(id, req.user.id, req.body.hours);

    res.json({
      success: true,
      data: { hours },
      message: getSuccessMessage('business_hours.updated', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get business hours
 * GET /api/v1/businesses/:id/hours
 */
export async function getBusinessHoursController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const hours = await getBusinessHours(id);

    res.json({
      success: true,
      data: { hours },
      message: getSuccessMessage('business_hours.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}


