/**
 * Policy Routes
 * Cancellation policy endpoints
 */

import { Router } from 'express';
import {
  createPolicyController,
  listPoliciesController,
  getPolicyController,
  updatePolicyController,
  deletePolicyController,
} from '../controllers/policy.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createPolicySchema,
  updatePolicySchema,
  policyQuerySchema,
} from '../validators/policy.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Policy Routes
 */

/**
 * @route   POST /api/v1/policies
 * @desc    Create cancellation policy
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/policies',
  authGuard,
  standardRateLimit,
  validateBody(createPolicySchema),
  createPolicyController
);

/**
 * @route   GET /api/v1/policies
 * @desc    List cancellation policies
 * @access  Private (Owner/Admin)
 */
router.get(
  '/policies',
  authGuard,
  standardRateLimit,
  validateQuery(policyQuerySchema),
  listPoliciesController
);

/**
 * @route   GET /api/v1/policies/:id
 * @desc    Get cancellation policy by ID
 * @access  Private (Owner/Admin)
 */
router.get(
  '/policies/:id',
  authGuard,
  standardRateLimit,
  getPolicyController
);

/**
 * @route   PUT /api/v1/policies/:id
 * @desc    Update cancellation policy
 * @access  Private (Owner/Admin only)
 */
router.put(
  '/policies/:id',
  authGuard,
  standardRateLimit,
  validateBody(updatePolicySchema),
  updatePolicyController
);

/**
 * @route   DELETE /api/v1/policies/:id
 * @desc    Delete cancellation policy
 * @access  Private (Owner/Admin only)
 */
router.delete(
  '/policies/:id',
  authGuard,
  standardRateLimit,
  deletePolicyController
);

export default router;

