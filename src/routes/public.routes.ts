/**
 * Public Routes
 * Public-facing endpoints (no authentication required)
 */

import { Router } from 'express';
import {
  listBusinessesController,
  getBusinessController,
  getBusinessBySlugController,
  getBusinessServicesController,
} from '../controllers/business.controller';
import {
  getBusinessHoursController,
} from '../controllers/businessHours.controller';
import {
  getBusinessSettingsController,
} from '../controllers/businessSettings.controller';
import { validateQuery } from '../middleware/validation';
import { businessQuerySchema } from '../validators/business.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   GET /api/v1/public/businesses
 * @desc    List public businesses (approved and live only)
 * @access  Public
 */
router.get(
  '/businesses',
  standardRateLimit,
  validateQuery(businessQuerySchema),
  listBusinessesController
);

/**
 * @route   GET /api/v1/public/businesses/:id
 * @desc    Get public business by ID
 * @access  Public
 */
router.get(
  '/businesses/:id',
  standardRateLimit,
  getBusinessController
);

/**
 * @route   GET /api/v1/public/businesses/slug/:slug
 * @desc    Get public business by slug
 * @access  Public
 */
router.get(
  '/businesses/slug/:slug',
  standardRateLimit,
  getBusinessBySlugController
);

/**
 * @route   GET /api/v1/public/businesses/:id/services
 * @desc    Get public business services
 * @access  Public
 */
router.get(
  '/businesses/:id/services',
  standardRateLimit,
  getBusinessServicesController
);

/**
 * Business Hours Routes
 */

/**
 * @route   GET /api/v1/public/businesses/:id/hours
 * @desc    Get public business hours
 * @access  Public
 */
router.get(
  '/businesses/:id/hours',
  standardRateLimit,
  getBusinessHoursController
);

/**
 * Business Settings Routes
 */

/**
 * @route   GET /api/v1/public/businesses/:id/settings
 * @desc    Get public business settings
 * @access  Public
 */
router.get(
  '/businesses/:id/settings',
  standardRateLimit,
  getBusinessSettingsController
);

export default router;

