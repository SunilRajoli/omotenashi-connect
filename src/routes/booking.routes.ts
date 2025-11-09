/**
 * Booking Routes
 * Booking and availability endpoints
 */

import { Router } from 'express';
import {
  createBookingController,
  listBookingsController,
  getBookingController,
  updateBookingController,
  cancelBookingController,
  checkAvailabilityController,
  getAvailableResourcesController,
  addToWaitlistController,
} from '../controllers/booking.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingQuerySchema,
  availabilitySchema,
  cancelBookingSchema,
} from '../validators/booking.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Public (authenticated users) or Private (owners)
 */
router.post(
  '/bookings',
  standardRateLimit,
  authGuard, // Optional - can be made optional for public bookings
  validateBody(createBookingSchema),
  createBookingController
);

/**
 * @route   GET /api/v1/bookings
 * @desc    List bookings with filters
 * @access  Private (authenticated users)
 */
router.get(
  '/bookings',
  standardRateLimit,
  authGuard,
  validateQuery(bookingQuerySchema),
  listBookingsController
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (authenticated users)
 */
router.get(
  '/bookings/:id',
  standardRateLimit,
  authGuard,
  getBookingController
);

/**
 * @route   PUT /api/v1/bookings/:id
 * @desc    Update booking
 * @access  Private (authenticated users)
 */
router.put(
  '/bookings/:id',
  standardRateLimit,
  authGuard,
  validateBody(updateBookingSchema),
  updateBookingController
);

/**
 * @route   POST /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private (authenticated users)
 */
router.post(
  '/bookings/:id/cancel',
  standardRateLimit,
  authGuard,
  validateBody(cancelBookingSchema),
  cancelBookingController
);

/**
 * @route   GET /api/v1/availability
 * @desc    Check availability for a business/service/resource
 * @access  Public
 */
router.get(
  '/availability',
  standardRateLimit,
  validateQuery(availabilitySchema),
  checkAvailabilityController
);

/**
 * @route   GET /api/v1/availability/resources
 * @desc    Get available resources for a time slot
 * @access  Public
 */
router.get(
  '/availability/resources',
  standardRateLimit,
  getAvailableResourcesController
);

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add to waitlist
 * @access  Public (authenticated users)
 */
router.post(
  '/waitlist',
  standardRateLimit,
  authGuard, // Optional - can be made optional
  addToWaitlistController
);

export default router;

