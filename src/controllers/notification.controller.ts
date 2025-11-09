/**
 * Notification Controller
 * Handles notification-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createNotification,
  listNotifications,
  getNotificationById,
  updateNotification,
  retryNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats,
} from '../services/notification.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationQueryParams,
  UpdateNotificationPreferencesRequest,
} from '../validators/notification.validator';

/**
 * Create notification
 * POST /api/v1/notifications
 */
export async function createNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateNotificationRequest = req.body;
    const userId = req.user?.id;

    const notification = await createNotification(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List notifications
 * GET /api/v1/notifications
 */
export async function listNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as NotificationQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { notifications, total, page, limit } = await listNotifications(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { notifications, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notification by ID
 * GET /api/v1/notifications/:id
 */
export async function getNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const notification = await getNotificationById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update notification
 * PUT /api/v1/notifications/:id
 */
export async function updateNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateNotificationRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const notification = await updateNotification(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retry failed notification
 * POST /api/v1/notifications/:id/retry
 */
export async function retryNotificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const notification = await retryNotification(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('retried', locale),
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
export async function getNotificationPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const preferences = await getNotificationPreferences(userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update notification preferences
 * PUT /api/v1/notifications/preferences
 */
export async function updateNotificationPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: UpdateNotificationPreferencesRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const preferences = await updateNotificationPreferences(userId, data);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notification statistics
 * GET /api/v1/notifications/stats
 */
export async function getNotificationStatsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const stats = await getNotificationStats(userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

