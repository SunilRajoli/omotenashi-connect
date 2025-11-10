/**
 * Waitlist Routes
 * API endpoints for waitlist management
 */

import { Router } from 'express';
import { z } from 'zod';
import {
  createWaitlistController,
  getWaitlistController,
  listWaitlistController,
  updateWaitlistController,
  cancelWaitlistController,
  notifyWaitlistController,
  convertWaitlistController,
} from '../controllers/waitlist.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createWaitlistSchema,
  updateWaitlistSchema,
  waitlistQuerySchema,
  notifyWaitlistSchema,
} from '../validators/waitlist.validator';

const router = Router();

// Schema definitions
const uuidParamSchema = z.object({ id: z.string().uuid() });
const convertWaitlistBodySchema = z.object({ booking_id: z.string().uuid() });

/**
 * @route   POST /api/v1/waitlist
 * @desc    Create waitlist entry
 * @access  Private
 */
router.post(
  '/',
  authGuard,
  validateBody(createWaitlistSchema),
  createWaitlistController
);

/**
 * @route   GET /api/v1/waitlist
 * @desc    List waitlist entries
 * @access  Private
 */
router.get(
  '/',
  authGuard,
  validateQuery(waitlistQuerySchema),
  listWaitlistController
);

/**
 * @route   GET /api/v1/waitlist/:id
 * @desc    Get waitlist entry by ID
 * @access  Private
 */
router.get(
  '/:id',
  authGuard,
  validateParams(uuidParamSchema),
  getWaitlistController
);

/**
 * @route   PATCH /api/v1/waitlist/:id
 * @desc    Update waitlist entry
 * @access  Private
 */
router.patch(
  '/:id',
  authGuard,
  validateParams(uuidParamSchema),
  validateBody(updateWaitlistSchema),
  updateWaitlistController
);

/**
 * @route   DELETE /api/v1/waitlist/:id
 * @desc    Cancel waitlist entry
 * @access  Private
 */
router.delete(
  '/:id',
  authGuard,
  validateParams(uuidParamSchema),
  cancelWaitlistController
);

/**
 * @route   POST /api/v1/waitlist/:id/notify
 * @desc    Notify waitlist entry (when slot becomes available)
 * @access  Private (admin/business owner)
 */
router.post(
  '/:id/notify',
  authGuard,
  validateParams(uuidParamSchema),
  validateBody(notifyWaitlistSchema),
  notifyWaitlistController
);

/**
 * @route   POST /api/v1/waitlist/:id/convert
 * @desc    Convert waitlist entry to booking
 * @access  Private
 */
router.post(
  '/:id/convert',
  authGuard,
  validateParams(uuidParamSchema),
  validateBody(convertWaitlistBodySchema),
  convertWaitlistController
);

export default router;

