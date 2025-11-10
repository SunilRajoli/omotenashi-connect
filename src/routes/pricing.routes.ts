/**
 * Pricing Routes
 * API endpoints for pricing rule management
 */

import { Router } from 'express';
import {
  createPricingRuleController,
  getPricingRulesController,
  updatePricingRuleController,
  deletePricingRuleController,
  getPricePreviewController,
} from '../controllers/pricing.controller';
import { authGuard, requireOwnerOrAdmin } from '../middleware/authGuard';
import { validateBody, validateParams, validateAll } from '../middleware/validation';
import { createPricingRuleSchema, updatePricingRuleSchema, pricePreviewSchema } from '../validators/pricing.validator';
import { z } from 'zod';

const router = Router();

/**
 * @route   POST /api/v1/services/:id/pricing-rules
 * @desc    Create pricing rule for service
 * @access  Private (Owner, Admin)
 */
router.post(
  '/services/:id/pricing-rules',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: createPricingRuleSchema,
  }),
  createPricingRuleController
);

/**
 * @route   GET /api/v1/services/:id/pricing-rules
 * @desc    Get pricing rules for service
 * @access  Private (Owner, Admin)
 */
router.get(
  '/services/:id/pricing-rules',
  authGuard,
  requireOwnerOrAdmin,
  validateParams(z.object({ id: z.string().uuid() })),
  getPricingRulesController
);

/**
 * @route   PUT /api/v1/pricing-rules/:id
 * @desc    Update pricing rule
 * @access  Private (Owner, Admin)
 */
router.put(
  '/pricing-rules/:id',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: updatePricingRuleSchema,
  }),
  updatePricingRuleController
);

/**
 * @route   DELETE /api/v1/pricing-rules/:id
 * @desc    Delete pricing rule
 * @access  Private (Owner, Admin)
 */
router.delete(
  '/pricing-rules/:id',
  authGuard,
  requireOwnerOrAdmin,
  validateParams(z.object({ id: z.string().uuid() })),
  deletePricingRuleController
);

/**
 * @route   POST /api/v1/pricing/preview
 * @desc    Get price preview for specific date/time
 * @access  Private (Owner, Admin, Customer)
 */
router.post(
  '/pricing/preview',
  authGuard,
  validateBody(pricePreviewSchema),
  getPricePreviewController
);

export default router;

