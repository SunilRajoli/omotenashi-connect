/**
 * Feature Flag Routes
 * Feature flag management endpoints
 */

import { Router } from 'express';
import {
  createFeatureFlagController,
  listFeatureFlagsController,
  getFeatureFlagController,
  checkFeatureFlagController,
  updateFeatureFlagController,
  deleteFeatureFlagController,
} from '../controllers/featureFlag.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  featureFlagQuerySchema,
} from '../validators/featureFlag.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Feature Flag Routes
 */

/**
 * @route   POST /api/v1/feature-flags
 * @desc    Create feature flag
 * @access  Private (Admin only)
 */
router.post(
  '/feature-flags',
  authGuard,
  standardRateLimit,
  validateBody(createFeatureFlagSchema),
  createFeatureFlagController
);

/**
 * @route   GET /api/v1/feature-flags
 * @desc    List feature flags
 * @access  Private (Admin only)
 */
router.get(
  '/feature-flags',
  authGuard,
  standardRateLimit,
  validateQuery(featureFlagQuerySchema),
  listFeatureFlagsController
);

/**
 * @route   GET /api/v1/feature-flags/:id
 * @desc    Get feature flag by ID
 * @access  Private (Admin only)
 */
router.get(
  '/feature-flags/:id',
  authGuard,
  standardRateLimit,
  getFeatureFlagController
);

/**
 * @route   GET /api/v1/feature-flags/check/:name
 * @desc    Check feature flag by name
 * @access  Private (Authenticated users)
 */
router.get(
  '/feature-flags/check/:name',
  authGuard,
  standardRateLimit,
  checkFeatureFlagController
);

/**
 * @route   PUT /api/v1/feature-flags/:id
 * @desc    Update feature flag
 * @access  Private (Admin only)
 */
router.put(
  '/feature-flags/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateFeatureFlagSchema),
  updateFeatureFlagController
);

/**
 * @route   DELETE /api/v1/feature-flags/:id
 * @desc    Delete feature flag
 * @access  Private (Admin only)
 */
router.delete(
  '/feature-flags/:id',
  authGuard,
  standardRateLimit,
  deleteFeatureFlagController
);

export default router;

