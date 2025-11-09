import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Analytics query parameters schema
 */
export const analyticsQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;

/**
 * Dashboard statistics query schema
 */
export const dashboardStatsSchema = z.object({
  business_id: uuidSchema.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
});

export type DashboardStatsParams = z.infer<typeof dashboardStatsSchema>;

