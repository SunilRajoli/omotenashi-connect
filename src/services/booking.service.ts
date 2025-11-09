/**
 * Booking Service
 * Handles booking management, creation, updates, and queries
 */

import { Op, WhereOptions, Transaction } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Booking, BookingStatus, BookingSource } from '../models/booking.model';
import { BookingHistory } from '../models/bookingHistory.model';
import { BookingReminder } from '../models/bookingReminder.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Resource } from '../models/resource.model';
import { Customer } from '../models/customer.model';
import { Waitlist, WaitlistStatus } from '../models/waitlist.model';
import { BusinessSettings } from '../models/businessSettings.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { CreateBookingRequest, UpdateBookingRequest, BookingQueryParams } from '../validators/booking.validator';
import { checkAvailability, isTimeSlotAvailable, getAvailableResources } from './availability.service';
import { sendBookingConfirmation } from './email.service';
import { Locale } from '../types/enums';
import { env } from '../config/env';

/**
 * Create a new booking
 */
export async function createBooking(
  data: CreateBookingRequest,
  userId?: string,
  source: BookingSource = BookingSource.WEB
): Promise<Booking> {
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
    let service: Service | null = null;
    if (data.service_id) {
      service = await Service.findByPk(data.service_id, { transaction });
      if (!service || service.deleted_at || !service.is_active) {
        throw new NotFoundError('Service not found or inactive');
      }
      if (service.business_id !== data.business_id) {
        throw new BadRequestError('Service does not belong to this business');
      }
    }

    // Verify resource if provided
    let resource: Resource | null = null;
    if (data.resource_id) {
      resource = await Resource.findByPk(data.resource_id, { transaction });
      if (!resource || resource.deleted_at || !resource.is_active) {
        throw new NotFoundError('Resource not found or inactive');
      }
      if (resource.business_id !== data.business_id) {
        throw new BadRequestError('Resource does not belong to this business');
      }
    }

    // Verify customer if provided
    let customer: Customer | null = null;
    if (data.customer_id) {
      customer = await Customer.findByPk(data.customer_id, { transaction });
      if (!customer || customer.deleted_at) {
        throw new NotFoundError('Customer not found');
      }
      if (customer.business_id !== data.business_id) {
        throw new BadRequestError('Customer does not belong to this business');
      }
    } else if (userId) {
      // Try to find or create customer from user
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
        // Create customer from user
        const user = await import('../models/user.model').then((m) => m.User.findByPk(userId, { transaction }));
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

    // Find customer if userId provided but no customer found
    if (!customer && userId) {
      const customerWhere: WhereOptions = {
        business_id: data.business_id,
        user_id: userId,
        deleted_at: { [Op.is]: null },
      };
      customer = await Customer.findOne({
        where: customerWhere,
        transaction,
      });
    }

    // Validate time slot
    const startAt = new Date(data.start_at);
    const endAt = new Date(data.end_at);

    if (startAt >= endAt) {
      throw new BadRequestError('Start time must be before end time');
    }

    if (startAt < new Date()) {
      throw new BadRequestError('Cannot book in the past');
    }

    // Check availability
    const available = await isTimeSlotAvailable(
      data.business_id,
      startAt,
      endAt,
      {
        serviceId: data.service_id,
        resourceId: data.resource_id,
      }
    );

    if (!available) {
      throw new ConflictError('Time slot is not available');
    }

    // If resource not specified but service requires one, find available resource
    let finalResourceId = data.resource_id;
    if (!finalResourceId && service) {
      const availableResources = await getAvailableResources(
        data.business_id,
        startAt,
        endAt,
        service.id
      );

      if (availableResources.length > 0) {
        // Use first available resource
        finalResourceId = availableResources[0].id;
      } else {
        throw new ConflictError('No available resources for this time slot');
      }
    }

    // Calculate price snapshot
    const priceSnapshot: Record<string, unknown> = {};
    if (service) {
      priceSnapshot.service_id = service.id;
      priceSnapshot.service_name_ja = service.name_ja;
      priceSnapshot.service_name_en = service.name_en;
      priceSnapshot.price_cents = service.price_cents || 0;
      priceSnapshot.duration_minutes = service.duration_minutes || 60;
    }

    // Get cancellation policy snapshot
    let policySnapshot: Record<string, unknown> | undefined;
    if (service?.policy_id) {
      const policy = await import('../models/cancellationPolicy.model').then((m) =>
        m.CancellationPolicy.findByPk(service.policy_id, { transaction })
      );
      if (policy) {
        policySnapshot = {
          policy_id: policy.id,
          name: policy.name,
          hours_before: policy.hours_before,
          penalty_percent: policy.penalty_percent,
        };
      }
    }

    // Determine initial status
    let initialStatus = BookingStatus.PENDING;
    if (service?.price_cents && service.price_cents > 0) {
      initialStatus = BookingStatus.PENDING_PAYMENT;
    } else {
      initialStatus = BookingStatus.CONFIRMED;
    }

    // Create booking
    const booking = await Booking.create(
      {
        business_id: data.business_id,
        service_id: data.service_id,
        resource_id: finalResourceId,
        customer_id: customer?.id,
        start_at: startAt,
        end_at: endAt,
        status: initialStatus,
        source,
        price_snapshot_json: priceSnapshot,
        policy_snapshot_json: policySnapshot,
        metadata: data.metadata || {},
      },
      { transaction }
    );

    // Create booking history entry
    await BookingHistory.create(
      {
        booking_id: booking.id,
        changed_by: userId,
        field_changed: 'status',
        old_value: undefined,
        new_value: initialStatus,
        reason: 'Booking created',
      },
      { transaction }
    );

    // Schedule booking reminders if confirmed
    if (initialStatus === BookingStatus.CONFIRMED) {
      const reminder24h = new Date(startAt);
      reminder24h.setHours(reminder24h.getHours() - 24);
      const reminder1h = new Date(startAt);
      reminder1h.setHours(reminder1h.getHours() - 1);

      if (reminder24h > new Date()) {
        await BookingReminder.create(
          {
            booking_id: booking.id,
            reminder_type: '24h',
            scheduled_at: reminder24h,
          },
          { transaction }
        );
      }

      if (reminder1h > new Date()) {
        await BookingReminder.create(
          {
            booking_id: booking.id,
            reminder_type: '1h',
            scheduled_at: reminder1h,
          },
          { transaction }
        );
      }
    }

    // Send confirmation email if customer has email
    if (customer?.email && initialStatus === BookingStatus.CONFIRMED) {
      try {
        const settings = await BusinessSettings.findOne({
          where: { business_id: data.business_id },
          transaction,
        });
        const locale = (settings?.default_locale as Locale) || Locale.JA;

        const businessName = business.display_name_ja || business.display_name_en || business.slug;
        const serviceName = service ? (service.name_ja || service.name_en) : 'Service';
        const customerName = customer.name || customer.email || 'Customer';

        // Format date and time
        const bookingDate = startAt.toLocaleDateString(locale === Locale.JA ? 'ja-JP' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const bookingTime = startAt.toLocaleTimeString(locale === Locale.JA ? 'ja-JP' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Format address
        const addressParts = [
          business.postal_code,
          business.prefecture,
          business.city,
          business.street,
          business.building,
        ].filter(Boolean);
        const businessAddress = addressParts.join(' ');

        await sendBookingConfirmation(customer.email, locale, {
          customerName,
          businessName,
          serviceName,
          bookingDate,
          bookingTime,
          bookingId: booking.id,
          businessAddress,
          businessPhone: business.phone || undefined,
        });
      } catch (error) {
        // Log error but don't fail booking creation
        logger.error({ error, bookingId: booking.id }, 'Failed to send booking confirmation email');
      }
    }

    logger.info(
      {
        bookingId: booking.id,
        businessId: data.business_id,
        serviceId: data.service_id,
        customerId: customer?.id,
      },
      'Booking created'
    );

    return booking.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
        { model: Resource, as: 'resource' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });
  });
}

/**
 * List bookings with filters
 */
export async function listBookings(
  query: BookingQueryParams,
  requesterId?: string,
  requesterRole?: string
): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  // Apply filters
  if (query.business_id) {
    where.business_id = query.business_id;
  }

  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }

  if (query.service_id) {
    where.service_id = query.service_id;
  }

  if (query.resource_id) {
    where.resource_id = query.resource_id;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.source) {
    where.source = query.source;
  }

  if (query.start_date || query.end_date) {
    where.start_at = {};
    if (query.start_date) {
      const startDate = new Date(query.start_date);
      startDate.setHours(0, 0, 0, 0);
      where.start_at[Op.gte] = startDate;
    }
    if (query.end_date) {
      const endDate = new Date(query.end_date);
      endDate.setHours(23, 59, 59, 999);
      where.start_at[Op.lte] = endDate;
    }
  }

  // Access control: customers can only see their own bookings
  if (requesterRole === 'customer' && requesterId) {
    const customer = await Customer.findOne({
      where: {
        user_id: requesterId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
    });
    if (customer) {
      where.customer_id = customer.id;
    } else {
      // No customer record, return empty
      return { bookings: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  // Owners can only see bookings for their businesses
  if (requesterRole === 'owner' && requesterId) {
      const businesses = await Business.findAll({
        where: {
          owner_id: requesterId,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        attributes: ['id'],
      });
    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { bookings: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
    where.business_id = { [Op.in]: businessIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      { model: Service, as: 'service', attributes: ['id', 'name_ja', 'name_en'] },
      { model: Resource, as: 'resource', attributes: ['id', 'name', 'type'] },
      { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
    ],
    order: [['start_at', 'DESC']],
    limit,
    offset,
  });

  return {
    bookings: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get booking by ID
 */
export async function getBookingById(
  bookingId: string,
  requesterId?: string,
  requesterRole?: string
): Promise<Booking> {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'service' },
      { model: Resource, as: 'resource' },
      { model: Customer, as: 'customer' },
      { model: BookingHistory, as: 'history', order: [['created_at', 'DESC']] },
    ],
  });

  if (!booking || booking.deleted_at) {
    throw new NotFoundError('Booking not found');
  }

  // Access control
  if (requesterRole === 'customer' && requesterId) {
    const customerWhere: WhereOptions = {
      user_id: requesterId,
      business_id: booking.business_id,
      deleted_at: { [Op.is]: null },
    };
    const customer = await Customer.findOne({
      where: customerWhere,
    });
    if (!customer || booking.customer_id !== customer.id) {
      throw new ForbiddenError('You can only view your own bookings');
    }
  }

  if (requesterRole === 'owner' && requesterId) {
    const business = await Business.findByPk(booking.business_id);
    if (!business || business.owner_id !== requesterId) {
      throw new ForbiddenError('You can only view bookings for your businesses');
    }
  }

  return booking;
}

/**
 * Update booking
 */
export async function updateBooking(
  bookingId: string,
  data: UpdateBookingRequest,
  userId: string,
  userRole: string
): Promise<Booking> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const booking = await Booking.findByPk(bookingId, { transaction });

    if (!booking || booking.deleted_at) {
      throw new NotFoundError('Booking not found');
    }

    // Access control
    if (userRole === 'customer') {
      const customerWhere: WhereOptions = {
        user_id: userId,
        business_id: booking.business_id,
        deleted_at: { [Op.is]: null },
      };
      const customer = await Customer.findOne({
        where: customerWhere,
        transaction,
      });
      if (!customer || booking.customer_id !== customer.id) {
        throw new ForbiddenError('You can only update your own bookings');
      }
    } else if (userRole === 'owner') {
      const business = await Business.findByPk(booking.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('You can only update bookings for your businesses');
      }
    }

    // Track changes
    const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

    // Update start/end times if provided
    if (data.start_at || data.end_at) {
      const newStartAt = data.start_at ? new Date(data.start_at) : booking.start_at;
      const newEndAt = data.end_at ? new Date(data.end_at) : booking.end_at;

      if (newStartAt >= newEndAt) {
        throw new BadRequestError('Start time must be before end time');
      }

      // Check availability if time changed
      if (newStartAt.getTime() !== booking.start_at.getTime() || newEndAt.getTime() !== booking.end_at.getTime()) {
        const available = await isTimeSlotAvailable(
          booking.business_id,
          newStartAt,
          newEndAt,
          {
            serviceId: booking.service_id || undefined,
            resourceId: booking.resource_id || undefined,
            excludeBookingId: booking.id,
          }
        );

        if (!available) {
          throw new ConflictError('New time slot is not available');
        }

        if (data.start_at) {
          changes.push({
            field: 'start_at',
            oldValue: booking.start_at.toISOString(),
            newValue: newStartAt.toISOString(),
          });
        }
        if (data.end_at) {
          changes.push({
            field: 'end_at',
            oldValue: booking.end_at.toISOString(),
            newValue: newEndAt.toISOString(),
          });
        }
      }

      await booking.update(
        {
          start_at: newStartAt,
          end_at: newEndAt,
        },
        { transaction }
      );
    }

    // Update status if provided
    if (data.status && data.status !== booking.status) {
      // Validate status transition
      const validTransitions: Record<BookingStatus, BookingStatus[]> = {
        [BookingStatus.PENDING]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.PENDING_PAYMENT]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        [BookingStatus.COMPLETED]: [],
        [BookingStatus.CANCELLED]: [],
        [BookingStatus.NO_SHOW]: [],
        [BookingStatus.EXPIRED]: [],
      };

      if (!validTransitions[booking.status]?.includes(data.status)) {
        throw new BadRequestError(`Invalid status transition from ${booking.status} to ${data.status}`);
      }

      changes.push({
        field: 'status',
        oldValue: booking.status,
        newValue: data.status,
      });

      await booking.update({ status: data.status }, { transaction });
    }

    // Update metadata if provided
    if (data.metadata) {
      await booking.update(
        {
          metadata: { ...booking.metadata, ...data.metadata },
        },
        { transaction }
      );
    }

    // Create history entries
    for (const change of changes) {
      await BookingHistory.create(
        {
          booking_id: booking.id,
          changed_by: userId,
          field_changed: change.field,
          old_value: String(change.oldValue),
          new_value: String(change.newValue),
        },
        { transaction }
      );
    }

    logger.info({ bookingId, userId, changes: changes.length }, 'Booking updated');

    return booking.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
        { model: Resource, as: 'resource' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });
  });
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  bookingId: string,
  userId: string,
  userRole: string,
  reason?: string
): Promise<Booking> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const booking = await Booking.findByPk(bookingId, { transaction });

    if (!booking || booking.deleted_at) {
      throw new NotFoundError('Booking not found');
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestError('Cannot cancel completed booking');
    }

    // Access control
    if (userRole === 'customer') {
      const customerWhere: WhereOptions = {
        user_id: userId,
        business_id: booking.business_id,
        deleted_at: { [Op.is]: null },
      };
      const customer = await Customer.findOne({
        where: customerWhere,
        transaction,
      });
      if (!customer || booking.customer_id !== customer.id) {
        throw new ForbiddenError('You can only cancel your own bookings');
      }
    } else if (userRole === 'owner') {
      const business = await Business.findByPk(booking.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('You can only cancel bookings for your businesses');
      }
    }

    // Update status
    await booking.update({ status: BookingStatus.CANCELLED }, { transaction });

    // Create history entry
    await BookingHistory.create(
      {
        booking_id: booking.id,
        changed_by: userId,
        field_changed: 'status',
        old_value: booking.status,
        new_value: BookingStatus.CANCELLED,
        reason: reason || 'Booking cancelled',
      },
      { transaction }
    );

    logger.info({ bookingId, userId, reason }, 'Booking cancelled');

    return booking.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'service' },
        { model: Resource, as: 'resource' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });
  });
}

/**
 * Add to waitlist
 */
export async function addToWaitlist(
  businessId: string,
  data: {
    serviceId?: string;
    customerId?: string;
    preferredDate?: string;
    preferredTimeStart?: string;
    preferredTimeEnd?: string;
  },
  userId?: string
): Promise<Waitlist> {
  // Verify business exists
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Verify service if provided
  if (data.serviceId) {
    const service = await Service.findByPk(data.serviceId);
    if (!service || service.deleted_at || !service.is_active) {
      throw new NotFoundError('Service not found or inactive');
    }
    if (service.business_id !== businessId) {
      throw new BadRequestError('Service does not belong to this business');
    }
  }

  // Get or create customer
  let customer: Customer | null = null;
  if (data.customerId) {
    customer = await Customer.findByPk(data.customerId);
    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }
  } else if (userId) {
    const customerWhere: WhereOptions = {
      business_id: businessId,
      user_id: userId,
      deleted_at: { [Op.is]: null },
    };
    customer = await Customer.findOne({
      where: customerWhere,
    });

    if (!customer) {
      const user = await import('../models/user.model').then((m) => m.User.findByPk(userId));
      if (user) {
        customer = await Customer.create({
          business_id: businessId,
          user_id: userId,
          name: user.display_name || `${user.given_name || ''} ${user.family_name || ''}`.trim(),
          email: user.email,
          phone: user.phone,
        });
      }
    }
  }

  if (!customer) {
    throw new BadRequestError('Customer is required');
  }

  // Create waitlist entry
  const waitlist = await Waitlist.create({
    business_id: businessId,
    service_id: data.serviceId,
    customer_id: customer.id,
    preferred_date: data.preferredDate ? new Date(data.preferredDate) : undefined,
    preferred_time_start: data.preferredTimeStart,
    preferred_time_end: data.preferredTimeEnd,
    status: WaitlistStatus.ACTIVE,
  });

  logger.info({ waitlistId: waitlist.id, businessId, customerId: customer.id }, 'Added to waitlist');

  return waitlist;
}
