/**
 * Business Settings Controller
 * HTTP handlers for business settings endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  updateBusinessSettings,
  getBusinessSettings,
} from '../services/businessSettings.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

/**
 * Update business settings
 * PUT /api/v1/owner/businesses/:id/settings
 */
export async function updateBusinessSettingsController(
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

    const settings = await updateBusinessSettings(id, req.user.id, req.body);

    res.json({
      success: true,
      data: settings,
      message: getSuccessMessage('business_settings.updated', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get business settings
 * GET /api/v1/businesses/:id/settings
 */
export async function getBusinessSettingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const settings = await getBusinessSettings(id);

    res.json({
      success: true,
      data: settings,
      message: getSuccessMessage('business_settings.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}


