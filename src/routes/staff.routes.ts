/**
 * Staff Routes
 * Staff management and scheduling endpoints
 */

import { Router } from 'express';
import {
  createStaffAssignmentController,
  listStaffAssignmentsController,
  getStaffAssignmentController,
  updateStaffAssignmentController,
  terminateStaffAssignmentController,
  createStaffWorkingHoursController,
  getStaffWorkingHoursController,
  createStaffExceptionController,
  listStaffExceptionsController,
  updateStaffExceptionController,
  deleteStaffExceptionController,
  assignStaffToBookingController,
} from '../controllers/staff.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createStaffAssignmentSchema,
  updateStaffAssignmentSchema,
  staffAssignmentQuerySchema,
  createStaffWorkingHoursSchema,
  createStaffExceptionSchema,
  updateStaffExceptionSchema,
  staffExceptionQuerySchema,
  assignStaffToBookingSchema,
} from '../validators/staff.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Staff Routes
 */

/**
 * @route   POST /api/v1/staff/assignments
 * @desc    Create staff assignment
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/staff/assignments',
  authGuard,
  standardRateLimit,
  validateBody(createStaffAssignmentSchema),
  createStaffAssignmentController
);

/**
 * @route   GET /api/v1/staff/assignments
 * @desc    List staff assignments
 * @access  Private (Owner/Admin/Staff)
 */
router.get(
  '/staff/assignments',
  authGuard,
  standardRateLimit,
  validateQuery(staffAssignmentQuerySchema),
  listStaffAssignmentsController
);

/**
 * @route   GET /api/v1/staff/assignments/:id
 * @desc    Get staff assignment by ID
 * @access  Private (Owner/Admin/Staff)
 */
router.get(
  '/staff/assignments/:id',
  authGuard,
  standardRateLimit,
  getStaffAssignmentController
);

/**
 * @route   PUT /api/v1/staff/assignments/:id
 * @desc    Update staff assignment
 * @access  Private (Owner/Admin only)
 */
router.put(
  '/staff/assignments/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateStaffAssignmentSchema),
  updateStaffAssignmentController
);

/**
 * @route   POST /api/v1/staff/assignments/:id/terminate
 * @desc    Terminate staff assignment
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/staff/assignments/:id/terminate',
  authGuard,
  standardRateLimit,
  terminateStaffAssignmentController
);

/**
 * @route   POST /api/v1/staff/working-hours
 * @desc    Create or update staff working hours
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/staff/working-hours',
  authGuard,
  standardRateLimit,
  validateBody(createStaffWorkingHoursSchema),
  createStaffWorkingHoursController
);

/**
 * @route   GET /api/v1/staff/working-hours/:resourceId
 * @desc    Get staff working hours
 * @access  Private (Owner/Admin/Staff)
 */
router.get(
  '/staff/working-hours/:resourceId',
  authGuard,
  standardRateLimit,
  getStaffWorkingHoursController
);

/**
 * @route   POST /api/v1/staff/exceptions
 * @desc    Create staff exception
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/staff/exceptions',
  authGuard,
  standardRateLimit,
  validateBody(createStaffExceptionSchema),
  createStaffExceptionController
);

/**
 * @route   GET /api/v1/staff/exceptions
 * @desc    List staff exceptions
 * @access  Private (Owner/Admin/Staff)
 */
router.get(
  '/staff/exceptions',
  authGuard,
  standardRateLimit,
  validateQuery(staffExceptionQuerySchema),
  listStaffExceptionsController
);

/**
 * @route   PUT /api/v1/staff/exceptions/:id
 * @desc    Update staff exception
 * @access  Private (Owner/Admin only)
 */
router.put(
  '/staff/exceptions/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateStaffExceptionSchema),
  updateStaffExceptionController
);

/**
 * @route   DELETE /api/v1/staff/exceptions/:id
 * @desc    Delete staff exception
 * @access  Private (Owner/Admin only)
 */
router.delete(
  '/staff/exceptions/:id',
  authGuard,
  standardRateLimit,
  deleteStaffExceptionController
);

/**
 * @route   POST /api/v1/staff/assign-to-booking
 * @desc    Assign staff to booking
 * @access  Private (Owner/Admin/Staff)
 */
router.post(
  '/staff/assign-to-booking',
  authGuard,
  standardRateLimit,
  validateBody(assignStaffToBookingSchema),
  assignStaffToBookingController
);

export default router;

