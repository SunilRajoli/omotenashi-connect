/**
 * Group Booking Controller
 * Handles group booking-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createGroupBooking,
  addParticipant,
  removeParticipant,
  getGroupBooking,
  listGroupBookings,
  updateGroupBookingStatus,
  checkInParticipant,
  recordParticipantPayment,
} from '../services/groupBooking.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateGroupBookingRequest,
  AddParticipantRequest,
  GroupBookingQueryParams,
  RecordParticipantPaymentRequest,
} from '../validators/groupBooking.validator';
import { GroupBookingStatus, PaymentSplitType } from '../models/groupBooking.model';

/**
 * Create group booking
 * POST /api/v1/group-bookings
 */
export async function createGroupBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateGroupBookingRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const groupBooking = await createGroupBooking(
      {
        ...data,
        payment_split_type: data.payment_split_type as PaymentSplitType,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
      },
      userId
    );

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('group_booking_created', locale),
      data: groupBooking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get group booking
 * GET /api/v1/group-bookings/:id
 */
export async function getGroupBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const groupBooking = await getGroupBooking(id, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('group_booking_retrieved', locale),
      data: groupBooking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List group bookings
 * GET /api/v1/group-bookings
 */
export async function listGroupBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as GroupBookingQueryParams;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const filters = {
      business_id: query.business_id,
      service_id: query.service_id,
      organizer_customer_id: query.organizer_customer_id,
      status: query.status as GroupBookingStatus | undefined,
      start_date: query.start_date ? new Date(query.start_date) : undefined,
      end_date: query.end_date ? new Date(query.end_date) : undefined,
      page: query.page,
      limit: query.limit,
    };

    const result = await listGroupBookings(filters, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('group_bookings_retrieved', locale),
      data: result.groupBookings,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add participant to group booking
 * POST /api/v1/group-bookings/:id/participants
 */
export async function addParticipantController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as AddParticipantRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const participant = await addParticipant(id, data.customer_id, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('participant_added', locale),
      data: participant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove participant from group booking
 * DELETE /api/v1/group-bookings/:id/participants/:participantId
 */
export async function removeParticipantController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, participantId } = req.params;
    const userId = req.user?.id;
    const locale = getLocale(req);

    await removeParticipant(id, participantId, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('participant_removed', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update group booking status
 * PUT /api/v1/group-bookings/:id/status
 */
export async function updateGroupBookingStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: GroupBookingStatus };
    const userId = req.user?.id;
    const locale = getLocale(req);

    const groupBooking = await updateGroupBookingStatus(id, status, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('group_booking_status_updated', locale),
      data: groupBooking,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check in participant
 * POST /api/v1/group-bookings/:id/participants/:participantId/check-in
 */
export async function checkInParticipantController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, participantId } = req.params;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const participant = await checkInParticipant(id, participantId, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('participant_checked_in', locale),
      data: participant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record participant payment
 * POST /api/v1/group-bookings/:id/participants/:participantId/payment
 */
export async function recordParticipantPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, participantId } = req.params;
    const data = req.body as RecordParticipantPaymentRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const participant = await recordParticipantPayment(
      id,
      participantId,
      data.payment_id,
      data.amount_cents,
      userId
    );

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('participant_payment_recorded', locale),
      data: participant,
    });
  } catch (error) {
    next(error);
  }
}

