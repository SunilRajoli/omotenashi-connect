/**
 * Membership Service
 * Handles membership subscriptions, packages, and punch cards
 */

import { Transaction, Op, WhereOptions } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Membership, MembershipType, MembershipStatus, BillingCycle } from '../models/membership.model';
import { MembershipPayment, PaymentStatus } from '../models/membershipPayment.model';
import { Business } from '../models/business.model';
import { Customer } from '../models/customer.model';
import { Booking } from '../models/booking.model';
import { NotFoundError, BadRequestError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

/**
 * Create a membership
 */
export async function createMembership(
  data: {
    business_id: string;
    customer_id: string;
    membership_type: MembershipType;
    name: string;
    description?: string;
    price_cents: number;
    billing_cycle?: BillingCycle;
    duration_days?: number;
    visits_included?: number;
    discount_percentage?: number;
    benefits?: Record<string, unknown>;
    auto_renew?: boolean;
    metadata?: Record<string, unknown>;
  },
  _userId?: string
): Promise<Membership> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify customer exists
    const customer = await Customer.findByPk(data.customer_id, { transaction });
    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }

    // Validate membership type specific fields
    if (data.membership_type === MembershipType.SUBSCRIPTION) {
      if (!data.billing_cycle) {
        throw new BadRequestError('Billing cycle is required for subscription memberships');
      }
    } else if (data.membership_type === MembershipType.PACKAGE) {
      if (!data.duration_days || data.duration_days < 1) {
        throw new BadRequestError('Duration days is required for package memberships');
      }
    } else if (data.membership_type === MembershipType.PUNCH_CARD) {
      if (!data.visits_included || data.visits_included < 1) {
        throw new BadRequestError('Visits included is required for punch card memberships');
      }
    }

    // Calculate dates
    const startDate = new Date();
    let endDate: Date | undefined;
    let nextBillingDate: Date | undefined;

    if (data.membership_type === MembershipType.PACKAGE && data.duration_days) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + data.duration_days);
    } else if (data.membership_type === MembershipType.SUBSCRIPTION && data.billing_cycle) {
      nextBillingDate = new Date(startDate);
      if (data.billing_cycle === BillingCycle.MONTHLY) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (data.billing_cycle === BillingCycle.QUARTERLY) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else if (data.billing_cycle === BillingCycle.YEARLY) {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }
    }

    // Create membership
    const membership = await Membership.create(
      {
        business_id: data.business_id,
        customer_id: data.customer_id,
        membership_type: data.membership_type,
        name: data.name,
        description: data.description,
        price_cents: data.price_cents,
        billing_cycle: data.billing_cycle,
        duration_days: data.duration_days,
        visits_included: data.visits_included,
        visits_used: 0,
        discount_percentage: data.discount_percentage,
        benefits: data.benefits || {},
        status: MembershipStatus.ACTIVE,
        start_date: startDate,
        end_date: endDate,
        next_billing_date: nextBillingDate,
        auto_renew: data.auto_renew !== false,
        metadata: data.metadata || {},
      },
      { transaction }
    );

    logger.info(
      { membershipId: membership.id, businessId: data.business_id, customerId: data.customer_id },
      'Membership created'
    );

    return membership;
  });
}

/**
 * Get membership by ID
 */
export async function getMembership(
  membershipId: string,
  _userId?: string
): Promise<Membership> {
  const membership = await Membership.findByPk(membershipId, {
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
      { model: MembershipPayment, as: 'payments' },
    ],
  });

  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership;
}

/**
 * List memberships
 */
export async function listMemberships(
  filters: {
    business_id?: string;
    customer_id?: string;
    membership_type?: MembershipType;
    status?: MembershipStatus;
    page?: number;
    limit?: number;
  },
  _userId?: string
): Promise<{
  memberships: Membership[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const where: WhereOptions<Membership> = {};

  if (filters.business_id) {
    where.business_id = filters.business_id;
  }

  if (filters.customer_id) {
    where.customer_id = filters.customer_id;
  }

  if (filters.membership_type) {
    where.membership_type = filters.membership_type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const { count, rows } = await Membership.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
    ],
    limit,
    offset,
    order: [['start_date', 'DESC']],
  });

  return {
    memberships: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update membership
 */
export async function updateMembership(
  membershipId: string,
  data: Partial<{
    name: string;
    description: string;
    discount_percentage: number;
    benefits: Record<string, unknown>;
    auto_renew: boolean;
    status: MembershipStatus;
    metadata: Record<string, unknown>;
  }>,
  _userId?: string
): Promise<Membership> {
  const membership = await Membership.findByPk(membershipId);
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  await membership.update(data);

  logger.info({ membershipId: membership.id }, 'Membership updated');

  return membership;
}

/**
 * Cancel membership
 */
export async function cancelMembership(
  membershipId: string,
  _userId?: string
): Promise<Membership> {
  const membership = await Membership.findByPk(membershipId);
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  if (membership.status === MembershipStatus.CANCELLED) {
    throw new BadRequestError('Membership is already cancelled');
  }

  await membership.update({
    status: MembershipStatus.CANCELLED,
    auto_renew: false,
    cancelled_at: new Date(),
  });

  logger.info({ membershipId: membership.id }, 'Membership cancelled');

  return membership;
}

/**
 * Use punch card visit
 */
export async function usePunchCardVisit(
  membershipId: string,
  bookingId: string,
  _userId?: string
): Promise<Membership> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const membership = await Membership.findByPk(membershipId, { transaction });
    if (!membership) {
      throw new NotFoundError('Membership not found');
    }

    if (membership.membership_type !== MembershipType.PUNCH_CARD) {
      throw new BadRequestError('Membership is not a punch card');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestError('Membership is not active');
    }

    if (!membership.visits_included) {
      throw new BadRequestError('Punch card has no visits included');
    }

    if (membership.visits_used >= membership.visits_included) {
      throw new BadRequestError('Punch card has no remaining visits');
    }

    // Verify booking exists
    const booking = await Booking.findByPk(bookingId, { transaction });
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Update visits used
    await membership.update(
      {
        visits_used: membership.visits_used + 1,
        metadata: {
          ...(membership.metadata as Record<string, unknown> || {}),
          last_booking_id: bookingId,
          last_used_at: new Date().toISOString(),
        },
      },
      { transaction }
    );

    // Check if punch card is exhausted
    if (membership.visits_used + 1 >= membership.visits_included) {
      await membership.update(
        {
          status: MembershipStatus.EXPIRED,
          end_date: new Date(),
        },
        { transaction }
      );
    }

    logger.info(
      { membershipId: membership.id, bookingId, visitsUsed: membership.visits_used + 1 },
      'Punch card visit used'
    );

    return membership.reload({ transaction });
  });
}

/**
 * Process recurring billing
 */
export async function processRecurringBilling(
  membershipId: string,
  paymentIntentId: string,
  amountCents: number,
  _userId?: string
): Promise<{ membership: Membership; payment: MembershipPayment }> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const membership = await Membership.findByPk(membershipId, { transaction });
    if (!membership) {
      throw new NotFoundError('Membership not found');
    }

    if (membership.membership_type !== MembershipType.SUBSCRIPTION) {
      throw new BadRequestError('Membership is not a subscription');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestError('Membership is not active');
    }

    // Create payment record
    const payment = await MembershipPayment.create(
      {
        membership_id: membershipId,
        amount_cents: amountCents,
        currency: 'JPY',
        payment_provider: 'stripe', // or 'payjp'
        payment_intent_id: paymentIntentId,
        status: PaymentStatus.SUCCEEDED,
        paid_at: new Date(),
        metadata: {},
      },
      { transaction }
    );

    // Update next billing date
    if (membership.billing_cycle && membership.next_billing_date) {
      const nextBillingDate = new Date(membership.next_billing_date);
      if (membership.billing_cycle === BillingCycle.MONTHLY) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (membership.billing_cycle === BillingCycle.QUARTERLY) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else if (membership.billing_cycle === BillingCycle.YEARLY) {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      await membership.update(
        {
          next_billing_date: nextBillingDate,
        },
        { transaction }
      );
    }

    logger.info(
      { membershipId: membership.id, paymentId: payment.id, amountCents },
      'Recurring billing processed'
    );

    return {
      membership: await membership.reload({ transaction }),
      payment,
    };
  });
}

/**
 * Get active membership for customer
 */
export async function getActiveMembership(
  businessId: string,
  customerId: string,
  _userId?: string
): Promise<Membership | null> {
  const now = new Date();
  return Membership.findOne({
    where: {
      business_id: businessId,
      customer_id: customerId,
      status: MembershipStatus.ACTIVE,
      [Op.or]: [
        { end_date: { [Op.is]: null } },
        { end_date: { [Op.gte]: now } },
      ],
    } as WhereOptions<Membership>,
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
    ],
    order: [['start_date', 'DESC']],
  });
}

/**
 * Check if customer has active membership
 */
export async function hasActiveMembership(
  businessId: string,
  customerId: string,
  _userId?: string
): Promise<boolean> {
  const membership = await getActiveMembership(businessId, customerId, _userId);
  return membership !== null;
}

/**
 * Apply membership discount to booking
 */
export async function applyMembershipDiscount(
  businessId: string,
  customerId: string,
  bookingPriceCents: number,
  _userId?: string
): Promise<{
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  membership?: Membership;
}> {
  const membership = await getActiveMembership(businessId, customerId, _userId);

  if (!membership || !membership.discount_percentage || membership.discount_percentage === 0) {
    return {
      originalPrice: bookingPriceCents,
      discountedPrice: bookingPriceCents,
      discountAmount: 0,
    };
  }

  const discountAmount = Math.floor((bookingPriceCents * membership.discount_percentage) / 100);
  const discountedPrice = bookingPriceCents - discountAmount;

  return {
    originalPrice: bookingPriceCents,
    discountedPrice,
    discountAmount,
    membership,
  };
}

