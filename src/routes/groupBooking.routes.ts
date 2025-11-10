/**
 * Group Booking Routes
 * API endpoints for group booking management
 */

import { Router } from 'express';
import {
  createGroupBookingController,
  getGroupBookingController,
  listGroupBookingsController,
  addParticipantController,
  removeParticipantController,
  updateGroupBookingStatusController,
  checkInParticipantController,
  recordParticipantPaymentController,
} from '../controllers/groupBooking.controller';
import { authGuard, requireOwnerOrAdmin } from '../middleware/authGuard';
import { validateBody, validateQuery, validateParams, validateAll } from '../middleware/validation';
import {
  createGroupBookingSchema,
  addParticipantSchema,
  groupBookingQuerySchema,
  recordParticipantPaymentSchema,
} from '../validators/groupBooking.validator';
import { z } from 'zod';

const router = Router();

/**
 * @route   POST /api/v1/group-bookings
 * @desc    Create group booking
 * @access  Private (Owner, Admin, Customer)
 */
router.post(
  '/group-bookings',
  authGuard,
  validateBody(createGroupBookingSchema),
  createGroupBookingController
);

/**
 * @route   GET /api/v1/group-bookings
 * @desc    List group bookings
 * @access  Private (Owner, Admin)
 */
router.get(
  '/group-bookings',
  authGuard,
  requireOwnerOrAdmin,
  validateQuery(groupBookingQuerySchema),
  listGroupBookingsController
);

/**
 * @route   GET /api/v1/group-bookings/:id
 * @desc    Get group booking
 * @access  Private (Owner, Admin, Customer)
 */
router.get(
  '/group-bookings/:id',
  authGuard,
  validateParams(z.object({ id: z.string().uuid() })),
  getGroupBookingController
);

/**
 * @route   POST /api/v1/group-bookings/:id/participants
 * @desc    Add participant to group booking
 * @access  Private (Owner, Admin, Customer)
 */
router.post(
  '/group-bookings/:id/participants',
  authGuard,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: addParticipantSchema,
  }),
  addParticipantController
);

/**
 * @route   DELETE /api/v1/group-bookings/:id/participants/:participantId
 * @desc    Remove participant from group booking
 * @access  Private (Owner, Admin)
 */
router.delete(
  '/group-bookings/:id/participants/:participantId',
  authGuard,
  requireOwnerOrAdmin,
  validateParams(z.object({ id: z.string().uuid(), participantId: z.string().uuid() })),
  removeParticipantController
);

/**
 * @route   PUT /api/v1/group-bookings/:id/status
 * @desc    Update group booking status
 * @access  Private (Owner, Admin)
 */
router.put(
  '/group-bookings/:id/status',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']) }),
  }),
  updateGroupBookingStatusController
);

/**
 * @route   POST /api/v1/group-bookings/:id/participants/:participantId/check-in
 * @desc    Check in participant
 * @access  Private (Staff, Admin)
 */
router.post(
  '/group-bookings/:id/participants/:participantId/check-in',
  authGuard,
  validateParams(z.object({ id: z.string().uuid(), participantId: z.string().uuid() })),
  checkInParticipantController
);

/**
 * @route   POST /api/v1/group-bookings/:id/participants/:participantId/payment
 * @desc    Record participant payment
 * @access  Private (Owner, Admin)
 */
router.post(
  '/group-bookings/:id/participants/:participantId/payment',
  authGuard,
  requireOwnerOrAdmin,
  validateAll({
    params: z.object({ id: z.string().uuid(), participantId: z.string().uuid() }),
    body: recordParticipantPaymentSchema,
  }),
  recordParticipantPaymentController
);

export default router;

