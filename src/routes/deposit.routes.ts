/**
 * Deposit Routes
 * API endpoints for deposit management
 */

import { Router } from 'express';
import {
  getDepositInfoController,
  getDepositStatusController,
} from '../controllers/deposit.controller';
import { authGuard, requireOwnerOrAdmin } from '../middleware/authGuard';
import { validateParams } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

/**
 * @route   GET /api/v1/bookings/:id/deposit
 * @desc    Get deposit information for booking
 * @access  Private (Owner, Admin)
 */
router.get(
  '/bookings/:id/deposit',
  authGuard,
  requireOwnerOrAdmin,
  validateParams(z.object({ id: z.string().uuid() })),
  getDepositInfoController
);

/**
 * @route   GET /api/v1/bookings/:id/deposit/status
 * @desc    Get deposit payment status
 * @access  Private (Owner, Admin)
 */
router.get(
  '/bookings/:id/deposit/status',
  authGuard,
  requireOwnerOrAdmin,
  validateParams(z.object({ id: z.string().uuid() })),
  getDepositStatusController
);

export default router;

