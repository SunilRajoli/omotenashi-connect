/**
 * Analytics Routes
 * Analytics and reporting endpoints
 */

import { Router } from 'express';
import {
  listAnalyticsController,
  getAnalyticsController,
  getDashboardStatsController,
  getBusinessAnalyticsController,
} from '../controllers/analytics.controller';
import { authGuard } from '../middleware/authGuard';
import { validateQuery } from '../middleware/validation';
import {
  analyticsQuerySchema,
  dashboardStatsSchema,
} from '../validators/analytics.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Analytics Routes
 */

/**
 * @route   GET /api/v1/analytics
 * @desc    List analytics data
 * @access  Private (Owner/Admin)
 */
router.get(
  '/analytics',
  authGuard,
  standardRateLimit,
  validateQuery(analyticsQuerySchema),
  listAnalyticsController
);

/**
 * @route   GET /api/v1/analytics/:id
 * @desc    Get analytics by ID
 * @access  Private (Owner/Admin)
 */
router.get(
  '/analytics/:id',
  authGuard,
  standardRateLimit,
  getAnalyticsController
);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Owner/Admin)
 */
router.get(
  '/analytics/dashboard',
  authGuard,
  standardRateLimit,
  validateQuery(dashboardStatsSchema),
  getDashboardStatsController
);

/**
 * @route   GET /api/v1/businesses/:businessId/analytics
 * @desc    Get business analytics summary
 * @access  Private (Owner/Admin)
 */
router.get(
  '/businesses/:businessId/analytics',
  authGuard,
  standardRateLimit,
  getBusinessAnalyticsController
);

export default router;

