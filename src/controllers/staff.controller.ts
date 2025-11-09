/**
 * Staff Controller
 * Handles staff-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createStaffAssignment,
  listStaffAssignments,
  getStaffAssignmentById,
  updateStaffAssignment,
  terminateStaffAssignment,
  createStaffWorkingHours,
  getStaffWorkingHours,
  createStaffException,
  listStaffExceptions,
  updateStaffException,
  deleteStaffException,
  assignStaffToBooking,
} from '../services/staff.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateStaffAssignmentRequest,
  UpdateStaffAssignmentRequest,
  StaffAssignmentQueryParams,
  CreateStaffWorkingHoursRequest,
  CreateStaffExceptionRequest,
  UpdateStaffExceptionRequest,
  StaffExceptionQueryParams,
  AssignStaffToBookingRequest,
} from '../validators/staff.validator';

/**
 * Create staff assignment
 * POST /api/v1/staff/assignments
 */
export async function createStaffAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateStaffAssignmentRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const assignment = await createStaffAssignment(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List staff assignments
 * GET /api/v1/staff/assignments
 */
export async function listStaffAssignmentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as StaffAssignmentQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { assignments, total, page, limit } = await listStaffAssignments(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { assignments, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get staff assignment by ID
 * GET /api/v1/staff/assignments/:id
 */
export async function getStaffAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const assignment = await getStaffAssignmentById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update staff assignment
 * PUT /api/v1/staff/assignments/:id
 */
export async function updateStaffAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateStaffAssignmentRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const assignment = await updateStaffAssignment(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Terminate staff assignment
 * POST /api/v1/staff/assignments/:id/terminate
 */
export async function terminateStaffAssignmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const assignment = await terminateStaffAssignment(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('terminated', locale),
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update staff working hours
 * POST /api/v1/staff/working-hours
 */
export async function createStaffWorkingHoursController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateStaffWorkingHoursRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const workingHours = await createStaffWorkingHours(data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { workingHours },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get staff working hours
 * GET /api/v1/staff/working-hours/:resourceId
 */
export async function getStaffWorkingHoursController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { resourceId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const workingHours = await getStaffWorkingHours(resourceId, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { workingHours },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create staff exception
 * POST /api/v1/staff/exceptions
 */
export async function createStaffExceptionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateStaffExceptionRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const exception = await createStaffException(data, userId, userRole);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { exception },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List staff exceptions
 * GET /api/v1/staff/exceptions
 */
export async function listStaffExceptionsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as StaffExceptionQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { exceptions, total, page, limit } = await listStaffExceptions(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { exceptions, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update staff exception
 * PUT /api/v1/staff/exceptions/:id
 */
export async function updateStaffExceptionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateStaffExceptionRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const exception = await updateStaffException(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { exception },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete staff exception
 * DELETE /api/v1/staff/exceptions/:id
 */
export async function deleteStaffExceptionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteStaffException(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Assign staff to booking
 * POST /api/v1/staff/assign-to-booking
 */
export async function assignStaffToBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: AssignStaffToBookingRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const booking = await assignStaffToBooking(data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('assigned', locale),
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

