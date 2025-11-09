/**
 * Booking Controller
 * Handles HTTP requests for booking operations
 */

import { Request, Response, NextFunction } from 'express';
import {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  addToWaitlist,
} from '../services/booking.service';
import { checkAvailability, getAvailableResources } from '../services/availability.service';
import { CreateBookingRequest, UpdateBookingRequest, BookingQueryParams, AvailabilityRequest } from '../validators/booking.validator';
import { BookingSource } from '../models/booking.model';
import { UserRole } from '../types/enums';
import { getSuccessMessage } from '../utils/messages';

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Public (authenticated users) or Private (owners)
 */
export async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateBookingRequest;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    // Determine source
    let source = BookingSource.WEB;
    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
      source = BookingSource.OWNER_PORTAL;
    }

    const booking = await createBooking(data, userId, source);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', 'ja'),
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/v1/bookings
 * @desc    List bookings with filters
 * @access  Private (authenticated users)
 */
export async function listBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as BookingQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    const result = await listBookings(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: {
        bookings: result.bookings,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (authenticated users)
 */
export async function getBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    const booking = await getBookingById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PUT /api/v1/bookings/:id
 * @desc    Update booking
 * @access  Private (authenticated users)
 */
export async function updateBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as UpdateBookingRequest;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    if (!userId || !userRole) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const booking = await updateBooking(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', 'ja'),
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private (authenticated users)
 */
export async function cancelBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    if (!userId || !userRole) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const booking = await cancelBooking(id, userId, userRole, reason);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('cancelled', 'ja'),
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/v1/availability
 * @desc    Check availability for a business/service/resource
 * @access  Public
 */
export async function checkAvailabilityController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as AvailabilityRequest;

    const result = await checkAvailability(query.business_id, {
      serviceId: query.service_id,
      resourceId: query.resource_id,
      date: query.date,
      durationMinutes: query.duration_minutes,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/v1/availability/resources
 * @desc    Get available resources for a time slot
 * @access  Public
 */
export async function getAvailableResourcesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { business_id, service_id, start_at, end_at } = req.query as {
      business_id: string;
      service_id?: string;
      start_at: string;
      end_at: string;
    };

    if (!business_id || !start_at || !end_at) {
      res.status(400).json({
        status: 'error',
        message: 'business_id, start_at, and end_at are required',
      });
      return;
    }

    const startAt = new Date(start_at);
    const endAt = new Date(end_at);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid date format',
      });
      return;
    }

    const resources = await getAvailableResources(business_id, startAt, endAt, service_id);

    res.status(200).json({
      status: 'success',
      data: { resources },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add to waitlist
 * @access  Public (authenticated users)
 */
export async function addToWaitlistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { business_id, service_id, customer_id, preferred_date, preferred_time_start, preferred_time_end } = req.body as {
      business_id: string;
      service_id?: string;
      customer_id?: string;
      preferred_date?: string;
      preferred_time_start?: string;
      preferred_time_end?: string;
    };

    const userId = req.user?.id;

    const waitlist = await addToWaitlist(business_id, {
      serviceId: service_id,
      customerId: customer_id,
      preferredDate: preferred_date,
      preferredTimeStart: preferred_time_start,
      preferredTimeEnd: preferred_time_end,
    }, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', 'ja'),
      data: { waitlist },
    });
  } catch (error) {
    next(error);
  }
}

