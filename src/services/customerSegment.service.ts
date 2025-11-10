/**
 * Customer Segment Service
 * Handles customer segmentation and targeting
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { CustomerSegment, SegmentStatus } from '../models/customerSegment.model';
import { Customer } from '../models/customer.model';
import { Business } from '../models/business.model';
import { CustomerTag } from '../models/customerTag.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';

export interface CreateSegmentRequest {
  business_id: string;
  name: string;
  description?: string;
  filter_rules: SegmentFilterRules;
}

export interface SegmentFilterRules {
  tags?: {
    include?: string[]; // Tag names to include
    exclude?: string[]; // Tag names to exclude
  };
  booking_count?: {
    operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
    value: number;
  };
  total_spent?: {
    operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
    value_cents: number;
  };
  last_visit?: {
    operator: 'gte' | 'lte' | 'before' | 'after';
    days: number;
  };
  no_show_count?: {
    operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
    value: number;
  };
  has_membership?: boolean;
  created_since?: {
    days: number;
  };
}

export interface SegmentQueryParams {
  business_id?: string;
  status?: SegmentStatus;
  page?: number;
  limit?: number;
}

/**
 * Create customer segment
 */
export async function createSegment(
  data: CreateSegmentRequest,
  userId?: string,
  userRole?: string
): Promise<CustomerSegment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      if (business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Create segment
    const segment = await CustomerSegment.create(
      {
        business_id: data.business_id,
        name: data.name,
        description: data.description,
        filter_rules_json: data.filter_rules as Record<string, unknown>,
        status: SegmentStatus.ACTIVE,
        created_by: userId,
      },
      { transaction }
    );

    // Calculate initial customer count
    try {
      const count = await calculateSegmentCount(segment.id, transaction);
      await segment.update({ customer_count: count, last_calculated_at: new Date() }, { transaction });
    } catch (error) {
      logger.error({ segmentId: segment.id, error }, 'Failed to calculate initial segment count');
    }

    logger.info({ segmentId: segment.id, businessId: data.business_id, name: data.name }, 'Segment created');

    return segment.reload({ transaction });
  });
}

/**
 * Get segment by ID
 */
export async function getSegment(
  segmentId: string,
  userId?: string,
  userRole?: string
): Promise<CustomerSegment> {
  const segment = await CustomerSegment.findByPk(segmentId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!segment) {
    throw new NotFoundError('Segment not found');
  }

  // Access control
  if (userRole !== 'admin' && userId) {
    const business = segment.get('business') as Business | undefined;
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('Access denied');
    }
  }

  return segment;
}

/**
 * List segments
 */
export async function listSegments(
  query: SegmentQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ segments: CustomerSegment[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.status) {
    where.status = query.status;
  }

  // Access control
  if (userRole !== 'admin' && userId && query.business_id) {
    const business = await Business.findByPk(query.business_id);
    if (!business || business.owner_id !== userId) {
      return { segments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await CustomerSegment.findAndCountAll({
    where,
    include: [{ model: Business, as: 'business' }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    segments: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update segment
 */
export async function updateSegment(
  segmentId: string,
  data: {
    name?: string;
    description?: string;
    filter_rules?: SegmentFilterRules;
    status?: SegmentStatus;
  },
  userId?: string,
  userRole?: string
): Promise<CustomerSegment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const segment = await CustomerSegment.findByPk(segmentId, { transaction });
    if (!segment) {
      throw new NotFoundError('Segment not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = await Business.findByPk(segment.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Update fields
    if (data.name !== undefined) {
      segment.name = data.name;
    }
    if (data.description !== undefined) {
      segment.description = data.description;
    }
    if (data.filter_rules !== undefined) {
      segment.filter_rules_json = data.filter_rules as Record<string, unknown>;
    }
    if (data.status !== undefined) {
      segment.status = data.status;
    }

    await segment.save({ transaction });

    // Recalculate customer count if filter rules changed
    if (data.filter_rules !== undefined) {
      try {
        const count = await calculateSegmentCount(segmentId, transaction);
        await segment.update({ customer_count: count, last_calculated_at: new Date() }, { transaction });
      } catch (error) {
        logger.error({ segmentId, error }, 'Failed to recalculate segment count');
      }
    }

    logger.info({ segmentId, updates: data }, 'Segment updated');

    return segment.reload({ transaction });
  });
}

/**
 * Delete segment
 */
export async function deleteSegment(
  segmentId: string,
  userId?: string,
  userRole?: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const segment = await CustomerSegment.findByPk(segmentId, { transaction });
    if (!segment) {
      throw new NotFoundError('Segment not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = await Business.findByPk(segment.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    await segment.destroy({ transaction });

    logger.info({ segmentId }, 'Segment deleted');
  });
}

/**
 * Calculate segment customer count
 */
export async function calculateSegmentCount(
  segmentId: string,
  transaction?: Transaction
): Promise<number> {
  const segment = await CustomerSegment.findByPk(segmentId, { transaction });
  if (!segment) {
    throw new NotFoundError('Segment not found');
  }

  const rules = segment.filter_rules_json as SegmentFilterRules;
  const customerIds = await getCustomersMatchingRules(segment.business_id, rules, transaction);

  return customerIds.length;
}

/**
 * Get customers matching segment rules
 */
export async function getCustomersMatchingRules(
  businessId: string,
  rules: SegmentFilterRules,
  transaction?: Transaction
): Promise<string[]> {
  // Start with all customers for this business
  const customerQuery: WhereOptions = {
    business_id: businessId,
    deleted_at: { [Op.is]: null },
  };

  // Apply tag filters
  if (rules.tags) {
    if (rules.tags.include && rules.tags.include.length > 0) {
      const customersWithTags = await CustomerTag.findAll({
        where: {
          business_id: businessId,
          tag_name: { [Op.in]: rules.tags.include },
        },
        attributes: ['customer_id'],
        group: ['customer_id'],
        having: sequelize.literal(`COUNT(DISTINCT tag_name) = ${rules.tags.include.length}`),
        transaction,
      });
      const includeIds = customersWithTags.map((t) => t.customer_id);
      if (includeIds.length === 0) {
        return []; // No customers match
      }
      customerQuery.id = { [Op.in]: includeIds };
    }

    if (rules.tags.exclude && rules.tags.exclude.length > 0) {
      const customersWithExcludedTags = await CustomerTag.findAll({
        where: {
          business_id: businessId,
          tag_name: { [Op.in]: rules.tags.exclude },
        },
        attributes: ['customer_id'],
        transaction,
      });
      const excludeIds = customersWithExcludedTags.map((t) => t.customer_id);
      if (excludeIds.length > 0) {
        if (customerQuery.id) {
          customerQuery.id = { [Op.in]: (customerQuery.id as { [Op.in]: string[] })[Op.in].filter((id: string) => !excludeIds.includes(id)) };
        } else {
          customerQuery.id = { [Op.notIn]: excludeIds };
        }
      }
    }
  }

  // Get initial customer set
  const customers = await Customer.findAll({
    where: customerQuery,
    attributes: ['id'],
    transaction,
  });

  let customerIdSet = new Set(customers.map((c) => c.id));

  // Apply booking count filter
  if (rules.booking_count) {
    const bookingCounts = await Booking.findAll({
      where: {
        business_id: businessId,
        customer_id: { [Op.in]: Array.from(customerIdSet) },
        status: { [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      attributes: [
        'customer_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['customer_id'],
      having: sequelize.literal(
        `COUNT(id) ${getOperatorSQL(rules.booking_count.operator)} ${rules.booking_count.value}`
      ),
      transaction,
    });
    customerIdSet = new Set(bookingCounts.map((b) => b.customer_id).filter((id): id is string => !!id));
  }

  // Apply total spent filter
  if (rules.total_spent) {
    // Get booking IDs for customers in segment
    const bookingIds = await Booking.findAll({
      where: {
        business_id: businessId,
        customer_id: { [Op.in]: Array.from(customerIdSet) },
      },
      attributes: ['id', 'customer_id'],
      transaction,
    });

    if (bookingIds.length === 0) {
      customerIdSet = new Set();
    } else {
      const bookingIdArray = bookingIds.map((b) => b.id);
      const payments = await BookingPayment.findAll({
        where: {
          booking_id: { [Op.in]: bookingIdArray },
          status: PaymentStatus.SUCCEEDED,
        },
        attributes: ['booking_id', 'amount_cents'],
        transaction,
      });

      // Calculate total spent per customer
      const customerTotals = new Map<string, number>();
      for (const payment of payments) {
        const booking = bookingIds.find((b) => b.id === payment.booking_id);
        if (booking && booking.customer_id) {
          const current = customerTotals.get(booking.customer_id) || 0;
          customerTotals.set(booking.customer_id, current + payment.amount_cents);
        }
      }

      // Filter by total spent
      const matchingCustomerIds: string[] = [];
      for (const [customerId, total] of customerTotals.entries()) {
        if (evaluateOperator(total, rules.total_spent.operator, rules.total_spent.value_cents)) {
          matchingCustomerIds.push(customerId);
        }
      }
      customerIdSet = new Set(matchingCustomerIds);
    }
  }

  // Apply last visit filter
  if (rules.last_visit) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - rules.last_visit.days);

    const lastVisits = await Booking.findAll({
      where: {
        business_id: businessId,
        customer_id: { [Op.in]: Array.from(customerIdSet) },
        status: BookingStatus.COMPLETED,
        end_at: rules.last_visit.operator === 'after' || rules.last_visit.operator === 'gte'
          ? { [Op.gte]: daysAgo }
          : { [Op.lte]: daysAgo },
      },
      attributes: ['customer_id'],
      group: ['customer_id'],
      transaction,
    });
    customerIdSet = new Set(lastVisits.map((b) => b.customer_id).filter((id): id is string => !!id));
  }

  // Apply no-show count filter
  if (rules.no_show_count) {
    const customersWithNoShows = await Customer.findAll({
      where: {
        business_id: businessId,
        id: { [Op.in]: Array.from(customerIdSet) },
        no_show_count: {
          [getOperatorForSequelize(rules.no_show_count.operator)]: rules.no_show_count.value,
        },
      },
      attributes: ['id'],
      transaction,
    });
    customerIdSet = new Set(customersWithNoShows.map((c) => c.id));
  }

  // Apply membership filter
  if (rules.has_membership !== undefined) {
    const { Membership, MembershipStatus } = await import('../models/membership.model');
    const members = await Membership.findAll({
      where: {
        business_id: businessId,
        customer_id: { [Op.in]: Array.from(customerIdSet) },
        status: MembershipStatus.ACTIVE,
      },
      attributes: ['customer_id'],
      transaction,
    });
    const memberIds = new Set(members.map((m) => m.customer_id));
    if (rules.has_membership) {
      customerIdSet = memberIds;
    } else {
      customerIdSet = new Set(Array.from(customerIdSet).filter((id) => !memberIds.has(id)));
    }
  }

  // Apply created since filter
  if (rules.created_since) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - rules.created_since.days);
    const recentCustomers = await Customer.findAll({
      where: {
        business_id: businessId,
        id: { [Op.in]: Array.from(customerIdSet) },
        created_at: { [Op.gte]: sinceDate },
      },
      attributes: ['id'],
      transaction,
    });
    customerIdSet = new Set(recentCustomers.map((c) => c.id));
  }

  return Array.from(customerIdSet);
}

/**
 * Get customers in segment
 */
export async function getSegmentCustomers(
  segmentId: string,
  page: number = 1,
  limit: number = 20,
  userId?: string,
  userRole?: string
): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
  const segment = await CustomerSegment.findByPk(segmentId);
  if (!segment) {
    throw new NotFoundError('Segment not found');
  }

  // Access control
  if (userRole !== 'admin' && userId) {
    const business = await Business.findByPk(segment.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('Access denied');
    }
  }

  const rules = segment.filter_rules_json as SegmentFilterRules;
  const customerIds = await getCustomersMatchingRules(segment.business_id, rules);

  const offset = (page - 1) * limit;
  const paginatedIds = customerIds.slice(offset, offset + limit);

  const customers = await Customer.findAll({
    where: {
      id: { [Op.in]: paginatedIds },
    },
    include: [
      { model: CustomerTag, as: 'tags' },
    ],
    order: [['created_at', 'DESC']],
  });

  return {
    customers,
    total: customerIds.length,
    page,
    limit,
  };
}

/**
 * Recalculate segment customer count
 */
export async function recalculateSegmentCount(
  segmentId: string,
  userId?: string,
  userRole?: string
): Promise<CustomerSegment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const segment = await CustomerSegment.findByPk(segmentId, { transaction });
    if (!segment) {
      throw new NotFoundError('Segment not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = await Business.findByPk(segment.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    const count = await calculateSegmentCount(segmentId, transaction);
    await segment.update(
      {
        customer_count: count,
        last_calculated_at: new Date(),
      },
      { transaction }
    );

    logger.info({ segmentId, count }, 'Segment count recalculated');

    return segment.reload({ transaction });
  });
}

/**
 * Helper: Get operator SQL
 */
function getOperatorSQL(operator: string): string {
  switch (operator) {
    case 'gte':
      return '>=';
    case 'lte':
      return '<=';
    case 'gt':
      return '>';
    case 'lt':
      return '<';
    case 'eq':
      return '=';
    default:
      return '=';
  }
}

/**
 * Helper: Get operator for Sequelize
 */
function getOperatorForSequelize(operator: string): symbol {
  switch (operator) {
    case 'gte':
      return Op.gte;
    case 'lte':
      return Op.lte;
    case 'gt':
      return Op.gt;
    case 'lt':
      return Op.lt;
    case 'eq':
      return Op.eq;
    default:
      return Op.eq;
  }
}

/**
 * Helper: Evaluate operator
 */
function evaluateOperator(actual: number, operator: string, expected: number): boolean {
  switch (operator) {
    case 'gte':
      return actual >= expected;
    case 'lte':
      return actual <= expected;
    case 'gt':
      return actual > expected;
    case 'lt':
      return actual < expected;
    case 'eq':
      return actual === expected;
    default:
      return false;
  }
}

