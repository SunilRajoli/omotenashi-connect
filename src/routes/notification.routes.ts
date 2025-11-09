/**
 * Notification Routes
 * Notification management and preferences endpoints
 */

import { Router } from 'express';
import {
  createNotificationController,
  listNotificationsController,
  getNotificationController,
  updateNotificationController,
  retryNotificationController,
  getNotificationPreferencesController,
  updateNotificationPreferencesController,
  getNotificationStatsController,
} from '../controllers/notification.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createNotificationSchema,
  updateNotificationSchema,
  notificationQuerySchema,
  updateNotificationPreferencesSchema,
} from '../validators/notification.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Notification Routes
 */

/**
 * @route   POST /api/v1/notifications
 * @desc    Create notification
 * @access  Private (Admin only)
 */
router.post(
  '/notifications',
  authGuard,
  standardRateLimit,
  validateBody(createNotificationSchema),
  createNotificationController
);

/**
 * @route   GET /api/v1/notifications
 * @desc    List notifications
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/notifications',
  authGuard,
  standardRateLimit,
  validateQuery(notificationQuerySchema),
  listNotificationsController
);

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get notification by ID
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/notifications/:id',
  authGuard,
  standardRateLimit,
  getNotificationController
);

/**
 * @route   PUT /api/v1/notifications/:id
 * @desc    Update notification
 * @access  Private (Admin only)
 */
router.put(
  '/notifications/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateNotificationSchema),
  updateNotificationController
);

/**
 * @route   POST /api/v1/notifications/:id/retry
 * @desc    Retry failed notification
 * @access  Private (Admin only)
 */
router.post(
  '/notifications/:id/retry',
  authGuard,
  standardRateLimit,
  retryNotificationController
);

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private (User only)
 */
router.get(
  '/notifications/preferences',
  authGuard,
  standardRateLimit,
  getNotificationPreferencesController
);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private (User only)
 */
router.put(
  '/notifications/preferences',
  authGuard,
  standardRateLimit,
  validateBody(updateNotificationPreferencesSchema),
  updateNotificationPreferencesController
);

/**
 * @route   GET /api/v1/notifications/stats
 * @desc    Get notification statistics
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/notifications/stats',
  authGuard,
  standardRateLimit,
  getNotificationStatsController
);

export default router;

