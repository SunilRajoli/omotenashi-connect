/**
 * Admin Routes
 * Admin-only endpoints for business management
 */

import { Router } from 'express';
import {
  approveBusinessController,
  rejectBusinessController,
  suspendBusinessController,
  listBusinessesForReviewController,
  getBusinessForReviewController,
} from '../controllers/admin.controller';
import { updateVerificationController } from '../controllers/verification.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  approveBusinessSchema,
  rejectBusinessSchema,
  suspendBusinessSchema,
  updateVerificationSchema,
  adminBusinessQuerySchema,
} from '../validators/admin.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Admin Routes
 * All routes require admin role
 */

/**
 * @route   GET /api/v1/admin/businesses
 * @desc    List businesses for admin review
 * @access  Private (Admin only)
 */
router.get(
  '/admin/businesses',
  authGuard,
  standardRateLimit,
  validateQuery(adminBusinessQuerySchema),
  listBusinessesForReviewController
);

/**
 * @route   GET /api/v1/admin/businesses/:id
 * @desc    Get business for admin review
 * @access  Private (Admin only)
 */
router.get(
  '/admin/businesses/:id',
  authGuard,
  standardRateLimit,
  getBusinessForReviewController
);

/**
 * @route   POST /api/v1/admin/businesses/:id/approve
 * @desc    Approve business
 * @access  Private (Admin only)
 */
router.post(
  '/admin/businesses/:id/approve',
  authGuard,
  standardRateLimit,
  validateBody(approveBusinessSchema),
  approveBusinessController
);

/**
 * @route   POST /api/v1/admin/businesses/:id/reject
 * @desc    Reject business
 * @access  Private (Admin only)
 */
router.post(
  '/admin/businesses/:id/reject',
  authGuard,
  standardRateLimit,
  validateBody(rejectBusinessSchema),
  rejectBusinessController
);

/**
 * @route   POST /api/v1/admin/businesses/:id/suspend
 * @desc    Suspend business
 * @access  Private (Admin only)
 */
router.post(
  '/admin/businesses/:id/suspend',
  authGuard,
  standardRateLimit,
  validateBody(suspendBusinessSchema),
  suspendBusinessController
);

/**
 * @route   PUT /api/v1/admin/verifications/:id
 * @desc    Update verification status
 * @access  Private (Admin only)
 */
router.put(
  '/admin/verifications/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateVerificationSchema),
  updateVerificationController
);

export default router;

