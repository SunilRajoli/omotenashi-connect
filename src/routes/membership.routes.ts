/**
 * Membership Routes
 * API endpoints for membership management
 */

import { Router } from 'express';
import {
  createMembershipController,
  getMembershipController,
  listMembershipsController,
  updateMembershipController,
  cancelMembershipController,
  usePunchCardVisitController,
  processRecurringBillingController,
  getActiveMembershipController,
  checkActiveMembershipController,
  applyMembershipDiscountController,
} from '../controllers/membership.controller';
import { authGuard, requireOwnerOrAdmin } from '../middleware/authGuard';
import { validateBody, validateQuery, validateParams, validateAll } from '../middleware/validation';
import {
  createMembershipSchema,
  updateMembershipSchema,
  membershipQuerySchema,
  usePunchCardVisitSchema,
  processRecurringBillingSchema,
} from '../validators/membership.validator';
import { z } from 'zod';

const router = Router();

/**
 * @route   POST /api/v1/memberships
 * @desc    Create membership
 * @access  Private (Owner, Admin)
 */
router.post(
  '/memberships',
  authGuard,
  requireOwnerOrAdmin,
  validateBody(createMembershipSchema),
  createMembershipController
);

/**
 * @route   GET /api/v1/memberships
 * @desc    List memberships
 * @access  Private (Owner, Admin)
 */
router.get(
  '/memberships',
  authGuard,
  requireOwnerOrAdmin,
  validateQuery(membershipQuerySchema),
  listMembershipsController
);

/**
 * @route   GET /api/v1/memberships/:id
 * @desc    Get membership
 * @access  Private (Owner, Admin, Customer)
 */
router.get(
  '/memberships/:id',
  authGuard,
  validateParams(z.object({ id: z.string().uuid() })),
  getMembershipController
);

/**
 * @route   PUT /api/v1/memberships/:id
 * @desc    Update membership
 * @access  Private (Owner, Admin)
 */
router.put(
  '/memberships/:id',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: updateMembershipSchema,
  }),
  updateMembershipController
);

/**
 * @route   POST /api/v1/memberships/:id/cancel
 * @desc    Cancel membership
 * @access  Private (Owner, Admin, Customer)
 */
router.post(
  '/memberships/:id/cancel',
  authGuard,
  validateParams(z.object({ id: z.string().uuid() })),
  cancelMembershipController
);

/**
 * @route   POST /api/v1/memberships/:id/use-visit
 * @desc    Use punch card visit
 * @access  Private (Owner, Admin, Staff)
 */
router.post(
  '/memberships/:id/use-visit',
  authGuard,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: usePunchCardVisitSchema,
  }),
  usePunchCardVisitController
);

/**
 * @route   POST /api/v1/memberships/:id/process-billing
 * @desc    Process recurring billing
 * @access  Private (Owner, Admin)
 */
router.post(
  '/memberships/:id/process-billing',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: processRecurringBillingSchema,
  }),
  processRecurringBillingController
);

/**
 * @route   GET /api/v1/memberships/active
 * @desc    Get active membership
 * @access  Private (Owner, Admin, Customer)
 */
router.get(
  '/memberships/active',
  authGuard,
  validateQuery(z.object({
    business_id: z.string().uuid(),
    customer_id: z.string().uuid(),
  })),
  getActiveMembershipController
);

/**
 * @route   GET /api/v1/memberships/check
 * @desc    Check active membership
 * @access  Private (Owner, Admin, Customer)
 */
router.get(
  '/memberships/check',
  authGuard,
  validateQuery(z.object({
    business_id: z.string().uuid(),
    customer_id: z.string().uuid(),
  })),
  checkActiveMembershipController
);

/**
 * @route   POST /api/v1/memberships/apply-discount
 * @desc    Apply membership discount to booking
 * @access  Private (Owner, Admin, Customer)
 */
router.post(
  '/memberships/apply-discount',
  authGuard,
  validateBody(z.object({
    business_id: z.string().uuid(),
    customer_id: z.string().uuid(),
    booking_price_cents: z.number().int().positive(),
  })),
  applyMembershipDiscountController
);

export default router;

