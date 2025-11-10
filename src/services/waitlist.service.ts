/**
 * Waitlist Service
 * Handles waitlist management with auto-notifications, priority levels, and response deadlines
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Waitlist, WaitlistStatus, WaitlistPriority } from '../models/waitlist.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { LineUser } from '../models/lineUser.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { Locale, NotificationTone } from '../types/enums';
import { sendLineMessage } from './line.service';
import { createNotification } from './notification.service';
import {
  CreateWaitlistRequest,
  UpdateWaitlistRequest,
  WaitlistQueryParams,
} from '../validators/waitlist.validator';

/**
 * Create waitlist entry
 */
export async function createWaitlist(
  data: CreateWaitlistRequest,
  userId?: string
): Promise<Waitlist> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify service if provided
    if (data.service_id) {
      const service = await Service.findByPk(data.service_id, { transaction });
      if (!service || service.deleted_at || !service.is_active) {
        throw new NotFoundError('Service not found or inactive');
      }
      if (service.business_id !== data.business_id) {
        throw new BadRequestError('Service does not belong to this business');
      }
    }

    // Get or create customer
    let customer: Customer | null = null;
    if (data.customer_id) {
      customer = await Customer.findByPk(data.customer_id, { transaction });
      if (!customer || customer.deleted_at) {
        throw new NotFoundError('Customer not found');
      }
    } else if (userId) {
      const customerWhere: WhereOptions = {
        business_id: data.business_id,
        user_id: userId,
        deleted_at: { [Op.is]: null },
      };
      customer = await Customer.findOne({
        where: customerWhere,
        transaction,
      });

      if (!customer) {
        const user = await User.findByPk(userId, { transaction });
        if (user) {
          customer = await Customer.create(
            {
              business_id: data.business_id,
              user_id: userId,
              name: user.display_name || `${user.given_name || ''} ${user.family_name || ''}`.trim(),
              email: user.email,
              phone: user.phone,
            },
            { transaction }
          );
        }
      }
    }

    if (!customer) {
      throw new BadRequestError('Customer is required');
    }

    // Check if customer already has an active waitlist entry for this service
    const existingWhere: WhereOptions = {
      business_id: data.business_id,
      customer_id: customer.id,
      status: {
        [Op.in]: [WaitlistStatus.ACTIVE, WaitlistStatus.NOTIFIED],
      },
    };

    if (data.service_id) {
      existingWhere.service_id = data.service_id;
    } else {
      existingWhere.service_id = { [Op.is]: null } as unknown as string;
    }

    const existingWaitlist = await Waitlist.findOne({
      where: existingWhere,
      transaction,
    });

    if (existingWaitlist) {
      throw new BadRequestError('Customer already has an active waitlist entry');
    }

    // Calculate response deadline
    const responseDeadlineHours = data.response_deadline_hours || 24; // Default 24 hours
    const responseDeadline = new Date();
    responseDeadline.setHours(responseDeadline.getHours() + responseDeadlineHours);

    // Determine priority if not provided
    let priority = data.priority || WaitlistPriority.NORMAL;
    if (!data.priority) {
      // Auto-assign priority based on customer history or membership
      // For now, default to NORMAL, but can be enhanced with membership checks
      priority = WaitlistPriority.NORMAL;
    }

    // Create waitlist entry
    const waitlist = await Waitlist.create(
      {
        business_id: data.business_id,
        service_id: data.service_id,
        customer_id: customer.id,
        preferred_date: data.preferred_date ? new Date(data.preferred_date) : undefined,
        preferred_time_start: data.preferred_time_start,
        preferred_time_end: data.preferred_time_end,
        status: WaitlistStatus.ACTIVE,
        priority,
        response_deadline: responseDeadline,
        notification_count: 0,
      },
      { transaction }
    );

    logger.info(
      { waitlistId: waitlist.id, businessId: data.business_id, customerId: customer.id, priority },
      'Waitlist entry created'
    );

    return waitlist.reload({ transaction });
  });
}

/**
 * Get waitlist entry by ID
 */
export async function getWaitlist(
  waitlistId: string,
  userId?: string,
  userRole?: string
): Promise<Waitlist> {
  const waitlist = await Waitlist.findByPk(waitlistId, {
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
      { model: Customer, as: 'customer' },
    ],
  });

  if (!waitlist) {
    throw new NotFoundError('Waitlist entry not found');
  }

  // Access control: users can only see their own waitlist entries unless admin
  if (userRole !== 'admin' && userId) {
    const customer = await Customer.findOne({
      where: { user_id: userId, business_id: waitlist.business_id },
    });
    if (!customer || customer.id !== waitlist.customer_id) {
      throw new ForbiddenError('Access denied');
    }
  }

  return waitlist;
}

/**
 * List waitlist entries
 */
export async function listWaitlist(
  query: WaitlistQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ waitlist: Waitlist[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.service_id) {
    where.service_id = query.service_id;
  }
  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.priority) {
    where.priority = query.priority;
  }

  // Access control: users can only see their own waitlist entries unless admin
  if (userRole !== 'admin' && userId) {
    const customer = await Customer.findOne({
      where: { user_id: userId, business_id: query.business_id },
    });
    if (customer) {
      where.customer_id = customer.id;
    } else {
      // If user has no customer record, return empty
      return { waitlist: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Waitlist.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
      { model: Customer, as: 'customer' },
    ],
    order: [
      [sequelize.literal(`CASE priority 
        WHEN 'vip' THEN 4 
        WHEN 'high' THEN 3 
        WHEN 'normal' THEN 2 
        WHEN 'low' THEN 1 
        ELSE 0 END`), 'DESC'],
      ['created_at', 'ASC'],
    ],
    limit,
    offset,
  });

  return {
    waitlist: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update waitlist entry
 */
export async function updateWaitlist(
  waitlistId: string,
  data: UpdateWaitlistRequest,
  userId?: string,
  userRole?: string
): Promise<Waitlist> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const waitlist = await Waitlist.findByPk(waitlistId, { transaction });
    if (!waitlist) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Access control
    if (userRole !== 'admin' && userId) {
      const customer = await Customer.findOne({
        where: { user_id: userId, business_id: waitlist.business_id },
        transaction,
      });
      if (!customer || customer.id !== waitlist.customer_id) {
        throw new ForbiddenError('Access denied');
      }
    }

    // Update fields
    if (data.preferred_date !== undefined) {
      waitlist.preferred_date = data.preferred_date ? new Date(data.preferred_date) : undefined;
    }
    if (data.preferred_time_start !== undefined) {
      waitlist.preferred_time_start = data.preferred_time_start;
    }
    if (data.preferred_time_end !== undefined) {
      waitlist.preferred_time_end = data.preferred_time_end;
    }
    if (data.priority !== undefined) {
      waitlist.priority = data.priority;
    }
    if (data.status !== undefined) {
      waitlist.status = data.status;
    }

    await waitlist.save({ transaction });

    logger.info({ waitlistId: waitlist.id, updates: data }, 'Waitlist entry updated');

    return waitlist.reload({ transaction });
  });
}

/**
 * Cancel waitlist entry
 */
export async function cancelWaitlist(
  waitlistId: string,
  userId?: string,
  userRole?: string
): Promise<Waitlist> {
  return updateWaitlist(waitlistId, { status: WaitlistStatus.CANCELLED }, userId, userRole);
}

/**
 * Notify waitlist entry (when slot becomes available)
 */
export async function notifyWaitlistEntry(
  waitlistId: string,
  availableSlot: {
    date: Date;
    time_start: string;
    time_end: string;
  },
  locale: Locale = Locale.JA
): Promise<Waitlist> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const waitlist = await Waitlist.findByPk(waitlistId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
      ],
      transaction,
    });

    if (!waitlist) {
      throw new NotFoundError('Waitlist entry not found');
    }

    if (waitlist.status !== WaitlistStatus.ACTIVE) {
      throw new BadRequestError('Waitlist entry is not active');
    }

    // Update waitlist status and notification tracking
    const now = new Date();
    const responseDeadlineHours = 24; // 24 hours to respond
    const responseDeadline = new Date();
    responseDeadline.setHours(responseDeadline.getHours() + responseDeadlineHours);

    waitlist.status = WaitlistStatus.NOTIFIED;
    waitlist.notified_at = now;
    waitlist.last_notified_at = now;
    waitlist.notification_count += 1;
    waitlist.response_deadline = responseDeadline;

    await waitlist.save({ transaction });

    // Reload waitlist with associations
    const waitlistWithCustomer = await Waitlist.findByPk(waitlistId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
      ],
      transaction,
    });

    if (!waitlistWithCustomer) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Get customer's user for notifications
    const customer = waitlistWithCustomer.get('customer') as Customer | null;
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const user = customer.user_id ? await User.findByPk(customer.user_id, { transaction }) : null;

    // Send LINE notification if available
    if (user) {
      const lineUser = await LineUser.findOne({
        where: { user_id: user.id },
        transaction,
      });

      if (lineUser && lineUser.line_user_id) {
        try {
          const service = waitlistWithCustomer.get('service') as Service | null;
          const business = waitlistWithCustomer.get('business') as Business | null;
          const serviceName = service?.name_ja || service?.name_en || 'サービス';
          const businessName = business?.display_name_ja || business?.display_name_en || 'ビジネス';
          const dateStr = availableSlot.date.toLocaleDateString('ja-JP');
          const timeStr = `${availableSlot.time_start} - ${availableSlot.time_end}`;

          const message = locale === Locale.JA
            ? `🎉 予約可能なお知らせ\n\n${businessName}の${serviceName}に空きができました。\n\n日時: ${dateStr} ${timeStr}\n\n24時間以内にご予約ください。\n\n予約する: [リンク]`
            : `🎉 Slot Available\n\nA slot is now available for ${serviceName} at ${businessName}.\n\nDate & Time: ${dateStr} ${timeStr}\n\nPlease book within 24 hours.\n\nBook now: [Link]`;

          await sendLineMessage(lineUser.line_user_id, message);
          logger.info({ waitlistId, lineUserId: lineUser.line_user_id }, 'LINE notification sent for waitlist');
        } catch (error) {
          logger.error({ waitlistId, error }, 'Failed to send LINE notification for waitlist');
        }
      }
    }

    // Send email notification
    if (customer.email) {
      try {
        const service = waitlistWithCustomer.get('service') as Service | null;
        const business = waitlistWithCustomer.get('business') as Business | null;
        const serviceName = locale === Locale.JA
          ? (service?.name_ja || service?.name_en || 'Service')
          : (service?.name_en || service?.name_ja || 'Service');
        const businessName = locale === Locale.JA
          ? (business?.display_name_ja || business?.display_name_en || 'Business')
          : (business?.display_name_en || business?.display_name_ja || 'Business');
        const dateStr = availableSlot.date.toLocaleDateString(locale === Locale.JA ? 'ja-JP' : 'en-US');
        const timeStr = `${availableSlot.time_start} - ${availableSlot.time_end}`;

        const subject = locale === Locale.JA
          ? `予約可能: ${businessName} - ${serviceName}`
          : `Slot Available: ${businessName} - ${serviceName}`;

        const html = locale === Locale.JA
          ? `
            <h2>予約可能なお知らせ</h2>
            <p>${businessName}の${serviceName}に空きができました。</p>
            <p><strong>日時:</strong> ${dateStr} ${timeStr}</p>
            <p>24時間以内にご予約ください。</p>
            <p><a href="[BOOKING_LINK]">予約する</a></p>
          `
          : `
            <h2>Slot Available</h2>
            <p>A slot is now available for ${serviceName} at ${businessName}.</p>
            <p><strong>Date & Time:</strong> ${dateStr} ${timeStr}</p>
            <p>Please book within 24 hours.</p>
            <p><a href="[BOOKING_LINK]">Book now</a></p>
          `;

        await createNotification(
          {
            kind: 'waitlist_notification',
            to_email: customer.email,
            locale,
            tone: NotificationTone.POLITE,
            template: 'waitlist_slot_available',
            data_json: {
              subject,
              html,
              business_name: businessName,
              service_name: serviceName,
              date: dateStr,
              time: timeStr,
              waitlist_id: waitlistId,
            },
          },
          user?.id
        );

        logger.info({ waitlistId, email: customer.email }, 'Email notification sent for waitlist');
      } catch (error) {
        logger.error({ waitlistId, error }, 'Failed to send email notification for waitlist');
      }
    }

    logger.info({ waitlistId, notificationCount: waitlist.notification_count }, 'Waitlist entry notified');

    return waitlist.reload({ transaction });
  });
}

/**
 * Convert waitlist entry to booking
 */
export async function convertWaitlistToBooking(
  waitlistId: string,
  bookingId: string,
): Promise<Waitlist> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const waitlist = await Waitlist.findByPk(waitlistId, { transaction });
    if (!waitlist) {
      throw new NotFoundError('Waitlist entry not found');
    }

    if (waitlist.status !== WaitlistStatus.NOTIFIED) {
      throw new BadRequestError('Waitlist entry must be in NOTIFIED status to convert');
    }

    waitlist.status = WaitlistStatus.CONVERTED;
    await waitlist.save({ transaction });

    logger.info({ waitlistId, bookingId }, 'Waitlist entry converted to booking');

    return waitlist.reload({ transaction });
  });
}

/**
 * Check and expire waitlist entries that have passed their response deadline
 */
export async function expireWaitlistEntries(): Promise<number> {
  const now = new Date();
  const expiredEntries = await Waitlist.update(
    {
      status: WaitlistStatus.EXPIRED,
    },
    {
      where: {
        status: WaitlistStatus.NOTIFIED,
        response_deadline: {
          [Op.lt]: now,
        },
      },
    }
  );

  const count = expiredEntries[0];
  if (count > 0) {
    logger.info({ count }, 'Expired waitlist entries');
  }

  return count;
}

/**
 * Get next waitlist entry to notify (by priority and creation date)
 */
export async function getNextWaitlistEntry(
  businessId: string,
  serviceId?: string,
  preferredDate?: Date
): Promise<Waitlist | null> {
  const where: WhereOptions = {
    business_id: businessId,
    status: WaitlistStatus.ACTIVE,
  };

  if (serviceId) {
    where.service_id = serviceId;
  }

  if (preferredDate) {
    where.preferred_date = preferredDate;
  }

  // Get the highest priority active waitlist entry
  const waitlist = await Waitlist.findOne({
    where,
    include: [
      { model: Customer, as: 'customer' },
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
    ],
    order: [
      [sequelize.literal(`CASE priority 
        WHEN 'vip' THEN 4 
        WHEN 'high' THEN 3 
        WHEN 'normal' THEN 2 
        WHEN 'low' THEN 1 
        ELSE 0 END`), 'DESC'],
      ['created_at', 'ASC'],
    ],
  });

  return waitlist;
}

