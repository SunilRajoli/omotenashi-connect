/**
 * Deposit Service
 * Handles deposit calculations, payments, and forfeiture logic
 */

import { Transaction } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Service } from '../models/service.model';
import { Booking } from '../models/booking.model';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import { NotFoundError, BadRequestError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

/**
 * Calculate deposit amount for service
 */
export function calculateDepositAmount(service: Service, totalAmount: number): number {
  if (!service.requires_deposit || service.deposit_percentage === 0) {
    return 0;
  }

  const depositAmount = Math.floor((totalAmount * service.deposit_percentage) / 100);
  return depositAmount;
}

/**
 * Calculate balance amount (remaining after deposit)
 */
export function calculateBalanceAmount(totalAmount: number, depositAmount: number): number {
  return Math.max(0, totalAmount - depositAmount);
}

/**
 * Check if deposit is required for booking
 */
export async function isDepositRequired(bookingId: string): Promise<boolean> {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: Service, as: 'service' }],
  });

  if (!booking || !booking.service_id) {
    return false;
  }

  const service = await Service.findByPk(booking.service_id);
  if (!service) {
    return false;
  }

  return service.requires_deposit && service.deposit_percentage > 0;
}

/**
 * Get deposit amount for booking
 */
export async function getDepositAmount(bookingId: string): Promise<{
  depositAmount: number;
  balanceAmount: number;
  totalAmount: number;
  depositPercentage: number;
}> {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: Service, as: 'service' }],
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (!booking.service_id) {
    throw new BadRequestError('Booking does not have a service');
  }

  const service = await Service.findByPk(booking.service_id);
  if (!service) {
    throw new NotFoundError('Service not found');
  }

  // Get total amount from price snapshot or service price
  const totalAmount = (booking.price_snapshot_json as { amount_cents?: number })?.amount_cents ||
    service.price_cents ||
    0;

  const depositAmount = calculateDepositAmount(service, totalAmount);
  const balanceAmount = calculateBalanceAmount(totalAmount, depositAmount);

  return {
    depositAmount,
    balanceAmount,
    totalAmount,
    depositPercentage: service.deposit_percentage,
  };
}

/**
 * Check if deposit payment is due
 */
export async function isDepositDue(bookingId: string): Promise<boolean> {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: Service, as: 'service' }],
  });

  if (!booking || !booking.service_id) {
    return false;
  }

  const service = await Service.findByPk(booking.service_id);
  if (!service || !service.requires_deposit) {
    return false;
  }

  // Check if deposit is already paid
  const depositPayment = await BookingPayment.findOne({
    where: {
      booking_id: bookingId,
      is_deposit: true,
      status: PaymentStatus.SUCCEEDED,
    },
  });

  if (depositPayment) {
    return false; // Deposit already paid
  }

  // Check if deposit due time has passed
  const depositDueTime = new Date(booking.created_at);
  depositDueTime.setHours(depositDueTime.getHours() + service.deposit_due_hours);

  return new Date() > depositDueTime;
}

/**
 * Get deposit payment status for booking
 */
export async function getDepositPaymentStatus(bookingId: string): Promise<{
  depositRequired: boolean;
  depositAmount: number;
  depositPaid: boolean;
  depositPayment?: BookingPayment;
  balanceAmount: number;
  balancePaid: boolean;
  balancePayment?: BookingPayment;
  totalAmount: number;
}> {
  const depositInfo = await getDepositAmount(bookingId);

  // Find deposit payment
  const depositPayment = await BookingPayment.findOne({
    where: {
      booking_id: bookingId,
      is_deposit: true,
    },
    order: [['created_at', 'DESC']],
  });

  // Find balance payment
  const balancePayment = await BookingPayment.findOne({
    where: {
      booking_id: bookingId,
      payment_type: 'balance',
    },
    order: [['created_at', 'DESC']],
  });

  return {
    depositRequired: depositInfo.depositAmount > 0,
    depositAmount: depositInfo.depositAmount,
    depositPaid: depositPayment?.status === PaymentStatus.SUCCEEDED || false,
    depositPayment: depositPayment || undefined,
    balanceAmount: depositInfo.balanceAmount,
    balancePaid: balancePayment?.status === PaymentStatus.SUCCEEDED || false,
    balancePayment: balancePayment || undefined,
    totalAmount: depositInfo.totalAmount,
  };
}

/**
 * Calculate deposit forfeiture amount
 */
export function calculateDepositForfeiture(
  depositAmount: number,
  cancellationPolicy?: { penalty_percent?: number; hours_before?: number }
): number {
  if (!cancellationPolicy || !cancellationPolicy.penalty_percent) {
    return 0; // No forfeiture if no policy
  }

  const forfeitureAmount = Math.floor((depositAmount * cancellationPolicy.penalty_percent) / 100);
  return forfeitureAmount;
}

/**
 * Process deposit forfeiture on cancellation
 */
export async function processDepositForfeiture(
  bookingId: string,
  cancellationPolicy?: { penalty_percent?: number; hours_before?: number }
): Promise<{
  forfeitureAmount: number;
  refundAmount: number;
}> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const depositPayment = await BookingPayment.findOne({
      where: {
        booking_id: bookingId,
        is_deposit: true,
        status: PaymentStatus.SUCCEEDED,
      },
      transaction,
    });

    if (!depositPayment) {
      return {
        forfeitureAmount: 0,
        refundAmount: 0,
      };
    }

    const forfeitureAmount = calculateDepositForfeiture(
      depositPayment.amount_cents,
      cancellationPolicy
    );
    const refundAmount = depositPayment.amount_cents - forfeitureAmount;

    // Update deposit payment status to indicate forfeiture
    if (forfeitureAmount > 0) {
      await depositPayment.update(
        {
          status: PaymentStatus.REFUNDED,
          raw_response: {
            ...(depositPayment.raw_response as Record<string, unknown> || {}),
            forfeiture_amount: forfeitureAmount,
            refund_amount: refundAmount,
            forfeited_at: new Date().toISOString(),
          },
        },
        { transaction }
      );

      logger.info(
        { bookingId, depositAmount: depositPayment.amount_cents, forfeitureAmount, refundAmount },
        'Deposit forfeiture processed'
      );
    }

    return {
      forfeitureAmount,
      refundAmount,
    };
  });
}

