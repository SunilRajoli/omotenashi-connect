/**
 * Review Routes
 * Review and moderation endpoints
 */

import { Router } from 'express';
import {
  createReviewController,
  listReviewsController,
  getReviewController,
  updateReviewController,
  moderateReviewController,
  respondToReviewController,
  deleteReviewController,
  getBusinessReviewStatsController,
} from '../controllers/review.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
  respondToReviewSchema,
  reviewQuerySchema,
} from '../validators/review.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Review Routes
 */

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 * @access  Private (Authenticated User)
 */
router.post(
  '/reviews',
  authGuard,
  standardRateLimit,
  validateBody(createReviewSchema),
  createReviewController
);

/**
 * @route   GET /api/v1/reviews
 * @desc    List reviews
 * @access  Public (with filters) / Private (with access control)
 */
router.get(
  '/reviews',
  standardRateLimit,
  validateQuery(reviewQuerySchema),
  listReviewsController
);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Public (visible reviews) / Private (with access control)
 */
router.get(
  '/reviews/:id',
  standardRateLimit,
  getReviewController
);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 * @access  Private (Customer/Owner/Admin)
 */
router.put(
  '/reviews/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateReviewSchema),
  updateReviewController
);

/**
 * @route   POST /api/v1/reviews/:id/moderate
 * @desc    Moderate review
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/reviews/:id/moderate',
  authGuard,
  standardRateLimit,
  validateBody(moderateReviewSchema),
  moderateReviewController
);

/**
 * @route   POST /api/v1/reviews/:id/respond
 * @desc    Respond to review
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/reviews/:id/respond',
  authGuard,
  standardRateLimit,
  validateBody(respondToReviewSchema),
  respondToReviewController
);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Private (Customer/Owner/Admin)
 */
router.delete(
  '/reviews/:id',
  authGuard,
  standardRateLimit,
  deleteReviewController
);

/**
 * @route   GET /api/v1/businesses/:businessId/reviews/stats
 * @desc    Get business review statistics
 * @access  Public
 */
router.get(
  '/businesses/:businessId/reviews/stats',
  standardRateLimit,
  getBusinessReviewStatsController
);

export default router;

