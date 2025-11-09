/**
 * Owner Routes
 * Business owner endpoints (authentication required)
 */

import { Router } from 'express';
import {
  createBusinessController,
  listBusinessesController,
  getBusinessController,
  updateBusinessController,
  deleteBusinessController,
  getBusinessServicesController,
} from '../controllers/business.controller';
import {
  updateBusinessHoursController,
  getBusinessHoursController,
} from '../controllers/businessHours.controller';
import {
  updateBusinessSettingsController,
  getBusinessSettingsController,
} from '../controllers/businessSettings.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessQuerySchema,
  businessSettingsSchema,
} from '../validators/business.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

// All owner routes require authentication
router.use(authGuard);

/**
 * @route   POST /api/v1/owner/businesses
 * @desc    Create a new business
 * @access  Private (Owner/Admin)
 */
router.post(
  '/businesses',
  standardRateLimit,
  validateBody(createBusinessSchema),
  createBusinessController
);

/**
 * @route   GET /api/v1/owner/businesses
 * @desc    List owner's businesses
 * @access  Private (Owner/Admin)
 */
router.get(
  '/businesses',
  standardRateLimit,
  validateQuery(businessQuerySchema),
  listBusinessesController
);

/**
 * @route   GET /api/v1/owner/businesses/:id
 * @desc    Get owner's business by ID
 * @access  Private (Owner/Admin)
 */
router.get(
  '/businesses/:id',
  standardRateLimit,
  getBusinessController
);

/**
 * @route   PUT /api/v1/owner/businesses/:id
 * @desc    Update owner's business
 * @access  Private (Owner/Admin)
 */
router.put(
  '/businesses/:id',
  standardRateLimit,
  validateBody(updateBusinessSchema),
  updateBusinessController
);

/**
 * @route   DELETE /api/v1/owner/businesses/:id
 * @desc    Delete owner's business
 * @access  Private (Owner/Admin)
 */
router.delete(
  '/businesses/:id',
  standardRateLimit,
  deleteBusinessController
);

/**
 * @route   GET /api/v1/owner/businesses/:id/services
 * @desc    Get owner's business services
 * @access  Private (Owner/Admin)
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
 * @route   PUT /api/v1/owner/businesses/:id/hours
 * @desc    Update business hours
 * @access  Private (Owner/Admin)
 */
router.put(
  '/businesses/:id/hours',
  standardRateLimit,
  updateBusinessHoursController
);

/**
 * @route   GET /api/v1/owner/businesses/:id/hours
 * @desc    Get business hours
 * @access  Private (Owner/Admin)
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
 * @route   PUT /api/v1/owner/businesses/:id/settings
 * @desc    Update business settings
 * @access  Private (Owner/Admin)
 */
router.put(
  '/businesses/:id/settings',
  standardRateLimit,
  validateBody(businessSettingsSchema),
  updateBusinessSettingsController
);

/**
 * @route   GET /api/v1/owner/businesses/:id/settings
 * @desc    Get business settings
 * @access  Private (Owner/Admin)
 */
router.get(
  '/businesses/:id/settings',
  standardRateLimit,
  getBusinessSettingsController
);

export default router;

