/**
 * Group Booking Service
 * Handles group booking management, participants, and split payments
 */

import { Transaction, Op, WhereOptions } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { GroupBooking, GroupBookingStatus, PaymentSplitType } from '../models/groupBooking.model';
import { GroupBookingParticipant, ParticipantPaymentStatus } from '../models/groupBookingParticipant.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

/**
 * Create a group booking
 */
export async function createGroupBooking(
  data: {
    business_id: string;
    service_id?: string;
    organizer_customer_id: string;
    group_name?: string;
    min_participants: number;
    max_participants: number;
    start_at: Date;
    end_at: Date;
    total_amount_cents: number;
    payment_split_type: PaymentSplitType;
    participant_ids?: string[];
    metadata?: Record<string, unknown>;
  },
  _userId?: string
): Promise<GroupBooking> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists and is approved
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    if (business.status !== 'approved' || business.onboarding_status !== 'live') {
      throw new BadRequestError('Business is not available for bookings');
    }

    // Verify service if provided
    if (data.service_id) {
      const service = await Service.findByPk(data.service_id, { transaction });
      if (!service || service.deleted_at || !service.is_active) {
        throw new NotFoundError('Service not found or inactive');
      }
    }

    // Verify organizer customer
    const organizer = await Customer.findByPk(data.organizer_customer_id, { transaction });
    if (!organizer || organizer.deleted_at) {
      throw new NotFoundError('Organizer customer not found');
    }

    // Validate participant count
    if (data.min_participants > data.max_participants) {
      throw new BadRequestError('Minimum participants cannot exceed maximum participants');
    }

    if (data.min_participants < 1) {
      throw new BadRequestError('Minimum participants must be at least 1');
    }

    // Create group booking
    const groupBooking = await GroupBooking.create(
      {
        business_id: data.business_id,
        service_id: data.service_id,
        organizer_customer_id: data.organizer_customer_id,
        group_name: data.group_name,
        min_participants: data.min_participants,
        max_participants: data.max_participants,
        current_participants: 1, // Organizer is first participant
        start_at: data.start_at,
        end_at: data.end_at,
        total_amount_cents: data.total_amount_cents,
        payment_split_type: data.payment_split_type,
        status: GroupBookingStatus.PENDING,
        metadata: data.metadata || {},
      },
      { transaction }
    );

    // Calculate amount per participant based on split type
    let amountPerParticipant = 0;
    if (data.payment_split_type === PaymentSplitType.SPLIT_EQUAL) {
      amountPerParticipant = Math.floor(data.total_amount_cents / data.max_participants);
    } else if (data.payment_split_type === PaymentSplitType.INDIVIDUAL) {
      // For individual, each participant pays their share
      amountPerParticipant = Math.floor(data.total_amount_cents / data.max_participants);
    }

    // Create organizer as first participant
    await GroupBookingParticipant.create(
      {
        group_booking_id: groupBooking.id,
        customer_id: data.organizer_customer_id,
        amount_owed_cents:
          data.payment_split_type === PaymentSplitType.ORGANIZER_PAYS
            ? data.total_amount_cents
            : amountPerParticipant,
        payment_status:
          data.payment_split_type === PaymentSplitType.ORGANIZER_PAYS
            ? ParticipantPaymentStatus.PENDING
            : ParticipantPaymentStatus.PENDING,
        checked_in: false,
        metadata: {},
      },
      { transaction }
    );

    // Add additional participants if provided
    if (data.participant_ids && data.participant_ids.length > 0) {
      for (const participantId of data.participant_ids) {
        const participant = await Customer.findByPk(participantId, { transaction });
        if (!participant || participant.deleted_at) {
          throw new NotFoundError(`Participant customer ${participantId} not found`);
        }

        await GroupBookingParticipant.create(
          {
            group_booking_id: groupBooking.id,
            customer_id: participantId,
            amount_owed_cents: amountPerParticipant,
            payment_status: ParticipantPaymentStatus.PENDING,
            checked_in: false,
            metadata: {},
          },
          { transaction }
        );
      }

      // Update current participants count
      await groupBooking.update(
        { current_participants: data.participant_ids.length + 1 },
        { transaction }
      );
    }

    logger.info(
      { groupBookingId: groupBooking.id, businessId: data.business_id },
      'Group booking created'
    );

    return groupBooking;
  });
}

/**
 * Add participant to group booking
 */
export async function addParticipant(
  groupBookingId: string,
  customerId: string,
  _userId?: string
): Promise<GroupBookingParticipant> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const groupBooking = await GroupBooking.findByPk(groupBookingId, { transaction });
    if (!groupBooking) {
      throw new NotFoundError('Group booking not found');
    }

    // Check if booking is full
    if (groupBooking.current_participants >= groupBooking.max_participants) {
      throw new BadRequestError('Group booking is full');
    }

    // Check if customer is already a participant
    const existing = await GroupBookingParticipant.findOne({
      where: {
        group_booking_id: groupBookingId,
        customer_id: customerId,
      },
      transaction,
    });

    if (existing) {
      throw new ConflictError('Customer is already a participant');
    }

    // Verify customer exists
    const customer = await Customer.findByPk(customerId, { transaction });
    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }

    // Calculate amount owed based on split type
    let amountOwed = 0;
    if (groupBooking.payment_split_type === PaymentSplitType.SPLIT_EQUAL) {
      amountOwed = Math.floor(groupBooking.total_amount_cents / groupBooking.max_participants);
    } else if (groupBooking.payment_split_type === PaymentSplitType.INDIVIDUAL) {
      amountOwed = Math.floor(groupBooking.total_amount_cents / groupBooking.max_participants);
    }

    // Create participant
    const participant = await GroupBookingParticipant.create(
      {
        group_booking_id: groupBookingId,
        customer_id: customerId,
        amount_owed_cents: amountOwed,
        payment_status: ParticipantPaymentStatus.PENDING,
        checked_in: false,
        metadata: {},
      },
      { transaction }
    );

    // Update current participants count
    await groupBooking.update(
      { current_participants: groupBooking.current_participants + 1 },
      { transaction }
    );

    logger.info(
      { groupBookingId, participantId: participant.id, customerId },
      'Participant added to group booking'
    );

    return participant;
  });
}

/**
 * Remove participant from group booking
 */
export async function removeParticipant(
  groupBookingId: string,
  participantId: string,
  _userId?: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const participant = await GroupBookingParticipant.findByPk(participantId, { transaction });
    if (!participant || participant.group_booking_id !== groupBookingId) {
      throw new NotFoundError('Participant not found');
    }

    // Cannot remove organizer
    const groupBooking = await GroupBooking.findByPk(groupBookingId, { transaction });
    if (!groupBooking) {
      throw new NotFoundError('Group booking not found');
    }

    if (participant.customer_id === groupBooking.organizer_customer_id) {
      throw new BadRequestError('Cannot remove organizer from group booking');
    }

    // Check if payment has been made
    if (participant.payment_status === ParticipantPaymentStatus.PAID) {
      throw new BadRequestError('Cannot remove participant who has already paid');
    }

    // Remove participant
    await participant.destroy({ transaction });

    // Update current participants count
    await groupBooking.update(
      { current_participants: groupBooking.current_participants - 1 },
      { transaction }
    );

    logger.info({ groupBookingId, participantId }, 'Participant removed from group booking');
  });
}

/**
 * Get group booking with participants
 */
export async function getGroupBooking(
  groupBookingId: string,
  _userId?: string
): Promise<GroupBooking & { participants: GroupBookingParticipant[] }> {
  const groupBooking = await GroupBooking.findByPk(groupBookingId, {
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
      { model: Customer, as: 'organizer' },
      { model: GroupBookingParticipant, as: 'participants' },
    ],
  });

  if (!groupBooking) {
    throw new NotFoundError('Group booking not found');
  }

  return groupBooking as GroupBooking & { participants: GroupBookingParticipant[] };
}

/**
 * List group bookings
 */
export async function listGroupBookings(
  filters: {
    business_id?: string;
    service_id?: string;
    organizer_customer_id?: string;
    status?: GroupBookingStatus;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  },
  _userId?: string
): Promise<{
  groupBookings: GroupBooking[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const where: WhereOptions<GroupBooking> = {};

  if (filters.business_id) {
    where.business_id = filters.business_id;
  }

  if (filters.service_id) {
    where.service_id = filters.service_id;
  }

  if (filters.organizer_customer_id) {
    where.organizer_customer_id = filters.organizer_customer_id;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.start_date || filters.end_date) {
    const startAtConditions: { [Op.gte]?: Date; [Op.lte]?: Date } = {};
    if (filters.start_date) {
      startAtConditions[Op.gte] = filters.start_date;
    }
    if (filters.end_date) {
      startAtConditions[Op.lte] = filters.end_date;
    }
    where.start_at = startAtConditions;
  }

  const { count, rows } = await GroupBooking.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
      { model: Customer, as: 'organizer' },
    ],
    limit,
    offset,
    order: [['start_at', 'ASC']],
  });

  return {
    groupBookings: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update group booking status
 */
export async function updateGroupBookingStatus(
  groupBookingId: string,
  status: GroupBookingStatus,
  _userId?: string
): Promise<GroupBooking> {
  const groupBooking = await GroupBooking.findByPk(groupBookingId);
  if (!groupBooking) {
    throw new NotFoundError('Group booking not found');
  }

  await groupBooking.update({ status });

  logger.info({ groupBookingId, status }, 'Group booking status updated');

  return groupBooking;
}

/**
 * Check in participant
 */
export async function checkInParticipant(
  groupBookingId: string,
  participantId: string,
  _userId?: string
): Promise<GroupBookingParticipant> {
  const participant = await GroupBookingParticipant.findOne({
    where: {
      id: participantId,
      group_booking_id: groupBookingId,
    },
  });

  if (!participant) {
    throw new NotFoundError('Participant not found');
  }

  if (participant.checked_in) {
    throw new BadRequestError('Participant is already checked in');
  }

  await participant.update({
    checked_in: true,
    checked_in_at: new Date(),
  });

  logger.info({ groupBookingId, participantId }, 'Participant checked in');

  return participant;
}

/**
 * Record participant payment
 */
export async function recordParticipantPayment(
  groupBookingId: string,
  participantId: string,
  paymentId: string,
  _amountCents: number,
  _userId?: string
): Promise<GroupBookingParticipant> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const participant = await GroupBookingParticipant.findByPk(participantId, { transaction });
    if (!participant || participant.group_booking_id !== groupBookingId) {
      throw new NotFoundError('Participant not found');
    }

    if (participant.payment_status === ParticipantPaymentStatus.PAID) {
      throw new BadRequestError('Participant has already paid');
    }

    // Verify payment exists and is successful
    const payment = await BookingPayment.findByPk(paymentId, { transaction });
    if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestError('Payment not found or not successful');
    }

    // Update participant payment status
    await participant.update(
      {
        payment_status: ParticipantPaymentStatus.PAID,
        metadata: {
          ...(participant.metadata as Record<string, unknown> || {}),
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
        },
      },
      { transaction }
    );

    // Check if all participants have paid (for split payments)
    const groupBooking = await GroupBooking.findByPk(groupBookingId, { transaction });
    if (groupBooking) {
      const allParticipants = await GroupBookingParticipant.findAll({
        where: { group_booking_id: groupBookingId },
        transaction,
      });

      const allPaid = allParticipants.every(
        (p) => p.payment_status === ParticipantPaymentStatus.PAID
      );

      if (allPaid && groupBooking.status === GroupBookingStatus.PENDING) {
        await groupBooking.update(
          { status: GroupBookingStatus.CONFIRMED },
          { transaction }
        );
      }
    }

    logger.info({ groupBookingId, participantId, paymentId }, 'Participant payment recorded');

    return participant;
  });
}

