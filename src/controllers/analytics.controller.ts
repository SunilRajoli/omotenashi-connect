/**
 * Analytics Controller
 * Handles analytics-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  listAnalytics,
  getAnalyticsById,
  getDashboardStats,
  getBusinessAnalyticsSummary,
} from '../services/analytics.service';
import { getSuccessMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  AnalyticsQueryParams,
  DashboardStatsParams,
} from '../validators/analytics.validator';

/**
 * List analytics data
 * GET /api/v1/analytics
 */
export async function listAnalyticsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as AnalyticsQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { analytics, total, page, limit } = await listAnalytics(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { analytics, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get analytics by ID
 * GET /api/v1/analytics/:id
 */
export async function getAnalyticsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const analytics = await getAnalyticsById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get dashboard statistics
 * GET /api/v1/analytics/dashboard
 */
export async function getDashboardStatsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as DashboardStatsParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const stats = await getDashboardStats(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get business analytics summary
 * GET /api/v1/businesses/:businessId/analytics
 */
export async function getBusinessAnalyticsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { businessId } = req.params;
    const { start_date, end_date } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const summary = await getBusinessAnalyticsSummary(
      businessId,
      start_date as string | undefined,
      end_date as string | undefined,
      userId,
      userRole
    );

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
}

