/**
 * Customer Tag Service
 * Handles customer tagging with manual and auto-tagging support
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { CustomerTag, TagType, TagCategory } from '../models/customerTag.model';
import { Customer } from '../models/customer.model';
import { Business } from '../models/business.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { BookingPayment, PaymentStatus } from '../models/bookingPayment.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';

export interface CreateTagRequest {
  business_id: string;
  customer_id: string;
  tag_name: string;
  category?: TagCategory;
  color?: string;
  description?: string;
}

export interface AutoTagRule {
  type: 'booking_count' | 'total_spent' | 'last_visit' | 'no_show_count' | 'membership' | 'custom';
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  value: number | string | Date;
  category?: TagCategory;
}

export interface TagQueryParams {
  business_id?: string;
  customer_id?: string;
  tag_name?: string;
  tag_type?: TagType | 'manual' | 'auto';
  category?: TagCategory;
  page?: number;
  limit?: number;
}

/**
 * Add tag to customer
 */
export async function addTagToCustomer(
  data: CreateTagRequest,
  userId?: string,
  userRole?: string
): Promise<CustomerTag> {
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

    // Verify customer exists
    const customer = await Customer.findByPk(data.customer_id, { transaction });
    if (!customer || customer.deleted_at || customer.business_id !== data.business_id) {
      throw new NotFoundError('Customer not found');
    }

    // Check if tag already exists
    const existingTag = await CustomerTag.findOne({
      where: {
        business_id: data.business_id,
        customer_id: data.customer_id,
        tag_name: data.tag_name,
      },
      transaction,
    });

    if (existingTag) {
      throw new BadRequestError('Tag already exists for this customer');
    }

    // Create tag
    const tag = await CustomerTag.create(
      {
        business_id: data.business_id,
        customer_id: data.customer_id,
        tag_name: data.tag_name,
        tag_type: TagType.MANUAL,
        category: data.category || TagCategory.CUSTOM,
        color: data.color,
        description: data.description,
        created_by: userId,
      },
      { transaction }
    );

    logger.info({ tagId: tag.id, customerId: data.customer_id, tagName: data.tag_name }, 'Tag added to customer');

    return tag.reload({ transaction });
  });
}

/**
 * Remove tag from customer
 */
export async function removeTagFromCustomer(
  tagId: string,
  userId?: string,
  userRole?: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const tag = await CustomerTag.findByPk(tagId, { transaction });
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const business = await Business.findByPk(tag.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Only allow removal of manual tags
    if (tag.tag_type === TagType.AUTO) {
      throw new BadRequestError('Cannot remove auto-generated tags');
    }

    await tag.destroy({ transaction });

    logger.info({ tagId, customerId: tag.customer_id }, 'Tag removed from customer');
  });
}

/**
 * List tags for customer or business
 */
export async function listTags(
  query: TagQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ tags: CustomerTag[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }
  if (query.tag_name) {
    where.tag_name = query.tag_name;
  }
  if (query.tag_type) {
    where.tag_type = query.tag_type;
  }
  if (query.category) {
    where.category = query.category;
  }

  // Access control
  if (userRole !== 'admin' && userId && query.business_id) {
    const business = await Business.findByPk(query.business_id);
    if (!business || business.owner_id !== userId) {
      return { tags: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await CustomerTag.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    tags: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Auto-tag customer based on rules
 */
export async function autoTagCustomer(
  customerId: string,
  rule: AutoTagRule,
  businessId: string
): Promise<CustomerTag | null> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const customer = await Customer.findByPk(customerId, { transaction });
    if (!customer || customer.deleted_at || customer.business_id !== businessId) {
      throw new NotFoundError('Customer not found');
    }

    // Check if tag already exists
    const tagName = generateTagName(rule);
    const existingTag = await CustomerTag.findOne({
      where: {
        business_id: businessId,
        customer_id: customerId,
        tag_name: tagName,
      },
      transaction,
    });

    if (existingTag) {
      return existingTag; // Tag already exists
    }

    // Evaluate rule
    const matches = await evaluateAutoTagRule(customerId, businessId, rule, transaction);
    if (!matches) {
      return null; // Rule doesn't match
    }

    // Create auto tag
    const tag = await CustomerTag.create(
      {
        business_id: businessId,
        customer_id: customerId,
        tag_name: tagName,
        tag_type: TagType.AUTO,
        category: rule.category || TagCategory.BEHAVIOR,
        auto_rule_json: rule as unknown as Record<string, unknown>,
        description: generateTagDescription(rule),
      },
      { transaction }
    );

    logger.info({ tagId: tag.id, customerId, tagName, rule }, 'Auto tag created');

    return tag.reload({ transaction });
  });
}

/**
 * Generate tag name from rule
 */
function generateTagName(rule: AutoTagRule): string {
  switch (rule.type) {
    case 'booking_count':
      return `Booked ${rule.operator === 'gte' ? '≥' : rule.operator === 'lte' ? '≤' : '='} ${rule.value} times`;
    case 'total_spent':
      return `Spent ${rule.operator === 'gte' ? '≥' : rule.operator === 'lte' ? '≤' : '='} ¥${Number(rule.value) / 100}`;
    case 'last_visit':
      return `Last visit ${rule.operator === 'gte' ? '≥' : '≤'} ${new Date(rule.value as string).toLocaleDateString()}`;
    case 'no_show_count':
      return `No-show ${rule.operator === 'gte' ? '≥' : rule.operator === 'lte' ? '≤' : '='} ${rule.value} times`;
    case 'membership':
      return 'Member';
    default:
      return `Custom: ${rule.type}`;
  }
}

/**
 * Generate tag description from rule
 */
function generateTagDescription(rule: AutoTagRule): string {
  return `Auto-generated tag based on rule: ${rule.type} ${rule.operator} ${rule.value}`;
}

/**
 * Evaluate auto-tag rule
 */
async function evaluateAutoTagRule(
  customerId: string,
  businessId: string,
  rule: AutoTagRule,
  transaction: Transaction
): Promise<boolean> {
  switch (rule.type) {
    case 'booking_count': {
      const count = await Booking.count({
        where: {
          customer_id: customerId,
          business_id: businessId,
          status: {
            [Op.in]: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
        },
        transaction,
      });
      return evaluateOperator(count, rule.operator, Number(rule.value));
    }

    case 'total_spent': {
      const payments = await BookingPayment.findAll({
        where: {
          booking_id: {
            [Op.in]: sequelize.literal(
              `(SELECT id FROM bookings WHERE customer_id = '${customerId}' AND business_id = '${businessId}')`
            ) as unknown as string[],
          },
          status: PaymentStatus.SUCCEEDED,
        },
        attributes: [[sequelize.fn('SUM', sequelize.col('amount_cents')), 'total']],
        transaction,
      });

      const total = payments[0]?.get('total') as number || 0;
      return evaluateOperator(total, rule.operator, Number(rule.value));
    }

    case 'last_visit': {
      const lastBooking = await Booking.findOne({
        where: {
          customer_id: customerId,
          business_id: businessId,
          status: {
            [Op.in]: [BookingStatus.COMPLETED],
          },
        },
        order: [['end_at', 'DESC']],
        transaction,
      });

      if (!lastBooking) {
        return false;
      }

      const lastVisitDate = new Date(lastBooking.end_at);
      const ruleDate = new Date(rule.value as string);
      return evaluateOperator(lastVisitDate.getTime(), rule.operator, ruleDate.getTime());
    }

    case 'no_show_count': {
      const customer = await Customer.findByPk(customerId, { transaction });
      if (!customer) {
        return false;
      }
      return evaluateOperator(customer.no_show_count, rule.operator, Number(rule.value));
    }

    case 'membership': {
      const { Membership, MembershipStatus } = await import('../models/membership.model');
      const membership = await Membership.findOne({
        where: {
          customer_id: customerId,
          business_id: businessId,
          status: MembershipStatus.ACTIVE,
        },
        transaction,
      });
      return !!membership;
    }

    default:
      return false;
  }
}

/**
 * Evaluate operator
 */
function evaluateOperator(actual: number, operator: AutoTagRule['operator'], expected: number): boolean {
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

/**
 * Process auto-tagging for all customers in a business
 */
export async function processAutoTagging(
  businessId: string,
  rules: AutoTagRule[],
): Promise<{ tagged: number; skipped: number }> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const business = await Business.findByPk(businessId, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Get all customers for this business
    const customers = await Customer.findAll({
      where: {
        business_id: businessId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      transaction,
    });

    let tagged = 0;
    let skipped = 0;

    for (const customer of customers) {
      for (const rule of rules) {
        try {
          const tag = await autoTagCustomer(customer.id, rule, businessId);
          if (tag) {
            tagged++;
          } else {
            skipped++;
          }
        } catch (error) {
          logger.error({ customerId: customer.id, rule, error }, 'Failed to auto-tag customer');
          skipped++;
        }
      }
    }

    logger.info({ businessId, tagged, skipped, totalCustomers: customers.length }, 'Auto-tagging completed');

    return { tagged, skipped };
  });
}

/**
 * Get tags for customer
 */
export async function getCustomerTags(
  customerId: string,
  businessId: string,
  userId?: string,
  userRole?: string
): Promise<CustomerTag[]> {
  // Access control
  if (userRole !== 'admin' && userId) {
    const business = await Business.findByPk(businessId);
    if (!business || business.owner_id !== userId) {
      const customer = await Customer.findByPk(customerId);
      if (!customer || customer.user_id !== userId) {
        throw new ForbiddenError('Access denied');
      }
    }
  }

  const tags = await CustomerTag.findAll({
    where: {
      customer_id: customerId,
      business_id: businessId,
    },
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
    ],
    order: [['tag_type', 'ASC'], ['created_at', 'DESC']],
  });

  return tags;
}

