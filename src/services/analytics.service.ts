/**
 * Analytics Service
 * Handles analytics data queries and dashboard statistics
 */

import { WhereOptions, Op } from 'sequelize';
import { AnalyticsDaily } from '../models/analyticsDaily.model';
import { Business } from '../models/business.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import {
  AnalyticsQueryParams,
  DashboardStatsParams,
} from '../validators/analytics.validator';

/**
 * List analytics data
 */
export async function listAnalytics(
  query: AnalyticsQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ analytics: AnalyticsDaily[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }

  // Date range filter
  if (query.start_date || query.end_date) {
    const dateFilter: { [Op.gte]?: string; [Op.lte]?: string } = {};
    if (query.start_date) {
      dateFilter[Op.gte] = query.start_date;
    }
    if (query.end_date) {
      dateFilter[Op.lte] = query.end_date;
    }
    where.date = dateFilter;
  }

  // Access control: owners can only see analytics for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { analytics: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // If business_id is specified, verify it belongs to the user
    if (query.business_id && !businessIds.includes(query.business_id)) {
      throw new ForbiddenError('You can only view analytics for your own businesses');
    }

    where.business_id = query.business_id ? query.business_id : { [Op.in]: businessIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await AnalyticsDaily.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
    ],
    order: [['date', 'DESC'], ['business_id', 'ASC']],
    limit,
    offset,
  });

  return {
    analytics: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get analytics by ID
 */
export async function getAnalyticsById(
  analyticsId: string,
  userId?: string,
  userRole?: string
): Promise<AnalyticsDaily> {
  const analytics = await AnalyticsDaily.findByPk(analyticsId, {
    include: [
      { model: Business, as: 'business' },
    ],
  });

  if (!analytics) {
    throw new NotFoundError('Analytics not found');
  }

  // Access control: owners can only see analytics for their businesses
  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(analytics.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view analytics for your own businesses');
    }
  }

  return analytics;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(
  params: DashboardStatsParams,
  userId?: string,
  userRole?: string
): Promise<{
  totalBookings: number;
  totalRevenue: number;
  totalCancellations: number;
  totalNoShows: number;
  averageRating: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  topServices: Array<{ serviceId: string; serviceName: string; bookings: number; revenue: number }>;
  dailyStats: Array<{ date: string; bookings: number; revenue: number }>;
}> {
  // Calculate date range based on period
  const endDate = params.end_date ? new Date(params.end_date) : new Date();
  let startDate: Date;

  if (params.start_date) {
    startDate = new Date(params.start_date);
  } else {
    // Calculate start date based on period
    startDate = new Date(endDate);
    switch (params.period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
  }

  const where: WhereOptions = {
    date: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    },
  };

  // Access control: owners can only see stats for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        totalCancellations: 0,
        totalNoShows: 0,
        averageRating: 0,
        revenueGrowth: 0,
        bookingsGrowth: 0,
        topServices: [],
        dailyStats: [],
      };
    }

    if (params.business_id && !businessIds.includes(params.business_id)) {
      throw new ForbiddenError('You can only view analytics for your own businesses');
    }

    where.business_id = params.business_id ? params.business_id : { [Op.in]: businessIds };
  } else if (params.business_id) {
    where.business_id = params.business_id;
  }

  // Get analytics data
  const analytics = await AnalyticsDaily.findAll({
    where,
    order: [['date', 'ASC']],
  });

  // Calculate totals
  const totalBookings = analytics.reduce((sum, a) => sum + a.bookings, 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue_cents, 0);
  const totalCancellations = analytics.reduce((sum, a) => sum + a.cancellations, 0);
  const totalNoShows = analytics.reduce((sum, a) => sum + a.no_shows, 0);

  // Calculate average rating
  const ratings = analytics.filter((a) => a.review_avg !== null && a.review_avg !== undefined);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, a) => sum + Number(a.review_avg || 0), 0) / ratings.length
      : 0;

  // Calculate growth (compare first half vs second half of period)
  const midPoint = Math.floor(analytics.length / 2);
  const firstHalf = analytics.slice(0, midPoint);
  const secondHalf = analytics.slice(midPoint);

  const firstHalfRevenue = firstHalf.reduce((sum, a) => sum + a.revenue_cents, 0);
  const secondHalfRevenue = secondHalf.reduce((sum, a) => sum + a.revenue_cents, 0);
  const revenueGrowth =
    firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

  const firstHalfBookings = firstHalf.reduce((sum, a) => sum + a.bookings, 0);
  const secondHalfBookings = secondHalf.reduce((sum, a) => sum + a.bookings, 0);
  const bookingsGrowth =
    firstHalfBookings > 0 ? ((secondHalfBookings - firstHalfBookings) / firstHalfBookings) * 100 : 0;

  // Get daily stats
  const dailyStats = analytics.map((a) => ({
    date: typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0],
    bookings: a.bookings,
    revenue: a.revenue_cents,
  }));

  // Top services (placeholder - would need Service model join)
  // For now, return empty array
  const topServices: Array<{ serviceId: string; serviceName: string; bookings: number; revenue: number }> = [];

  logger.info(
    {
      businessId: params.business_id,
      period: params.period,
      totalBookings,
      totalRevenue,
    },
    'Dashboard stats calculated'
  );

  return {
    totalBookings,
    totalRevenue,
    totalCancellations,
    totalNoShows,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    bookingsGrowth: Math.round(bookingsGrowth * 10) / 10,
    topServices,
    dailyStats,
  };
}

/**
 * Get business analytics summary
 */
export async function getBusinessAnalyticsSummary(
  businessId: string,
  startDate?: string,
  endDate?: string,
  userId?: string,
  userRole?: string
): Promise<{
  totalBookings: number;
  totalRevenue: number;
  totalCancellations: number;
  totalNoShows: number;
  averageRating: number;
  conversionRate: number;
  dailyBreakdown: Array<{
    date: string;
    bookings: number;
    revenue: number;
    cancellations: number;
    noShows: number;
    reviewAvg?: number;
  }>;
}> {
  // Verify business exists
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Access control: owners can only see analytics for their businesses
  if (userRole === 'owner' && userId) {
    if (business.owner_id !== userId) {
      throw new ForbiddenError('You can only view analytics for your own businesses');
    }
  }

  const where: WhereOptions = {
    business_id: businessId,
  };

  // Date range filter
  if (startDate || endDate) {
    const dateFilter: { [Op.gte]?: string; [Op.lte]?: string } = {};
    if (startDate) {
      dateFilter[Op.gte] = startDate;
    }
    if (endDate) {
      dateFilter[Op.lte] = endDate;
    }
    where.date = dateFilter;
  }

  // Get analytics data
  const analytics = await AnalyticsDaily.findAll({
    where,
    order: [['date', 'ASC']],
  });

  // Calculate totals
  const totalBookings = analytics.reduce((sum, a) => sum + a.bookings, 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue_cents, 0);
  const totalCancellations = analytics.reduce((sum, a) => sum + a.cancellations, 0);
  const totalNoShows = analytics.reduce((sum, a) => sum + a.no_shows, 0);

  // Calculate average rating
  const ratings = analytics.filter((a) => a.review_avg !== null && a.review_avg !== undefined);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, a) => sum + Number(a.review_avg || 0), 0) / ratings.length
      : 0;

  // Conversion rate (bookings / (bookings + cancellations + no_shows))
  const totalAttempts = totalBookings + totalCancellations + totalNoShows;
  const conversionRate = totalAttempts > 0 ? (totalBookings / totalAttempts) * 100 : 0;

  // Daily breakdown
  const dailyBreakdown = analytics.map((a) => ({
    date: typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0],
    bookings: a.bookings,
    revenue: a.revenue_cents,
    cancellations: a.cancellations,
    noShows: a.no_shows,
    reviewAvg: a.review_avg ? Number(a.review_avg) : undefined,
  }));

  return {
    totalBookings,
    totalRevenue,
    totalCancellations,
    totalNoShows,
    averageRating: Math.round(averageRating * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
    dailyBreakdown,
  };
}

