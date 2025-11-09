/**
 * Availability Service
 * Handles availability checking for bookings
 */

import { Op, WhereOptions } from 'sequelize';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import { Resource } from '../models/resource.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { BusinessHour } from '../models/businessHour.model';
import { BusinessHoliday } from '../models/businessHoliday.model';
import { NotFoundError, BadRequestError } from '../utils/httpErrors';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  resourceId?: string;
}

export interface AvailabilityResult {
  date: string;
  slots: TimeSlot[];
  businessHours?: {
    open: string;
    close: string;
    isClosed: boolean;
  };
}

/**
 * Check if a time slot is available
 */
export async function checkAvailability(
  businessId: string,
  options: {
    serviceId?: string;
    resourceId?: string;
    date: string; // YYYY-MM-DD
    durationMinutes?: number;
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
  }
): Promise<AvailabilityResult> {
  // Verify business exists and is approved
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  if (business.status !== 'approved' || business.onboarding_status !== 'live') {
    throw new BadRequestError('Business is not available for bookings');
  }

  // Parse date
  const targetDate = new Date(options.date);
  if (isNaN(targetDate.getTime())) {
    throw new BadRequestError('Invalid date format');
  }

  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

  // Get business hours for the day
  const businessHour = await BusinessHour.findOne({
    where: {
      business_id: businessId,
      day_of_week: dayOfWeek,
    },
  });

  // Check if it's a holiday
  const holiday = await BusinessHoliday.findOne({
    where: {
      business_id: businessId,
      date: options.date,
    },
  });

  const isClosed = businessHour?.is_closed || !!holiday;

  // If closed, return empty slots
  if (isClosed) {
    return {
      date: options.date,
      slots: [],
      businessHours: {
        open: businessHour?.open_time || '00:00',
        close: businessHour?.close_time || '00:00',
        isClosed: true,
      },
    };
  }

  // Get service if provided
  let service: Service | null = null;
  if (options.serviceId) {
    service = await Service.findByPk(options.serviceId);
    if (!service || service.deleted_at || !service.is_active) {
      throw new NotFoundError('Service not found or inactive');
    }
    if (service.business_id !== businessId) {
      throw new BadRequestError('Service does not belong to this business');
    }
  }

  // Get resource if provided
  let resource: Resource | null = null;
  if (options.resourceId) {
    resource = await Resource.findByPk(options.resourceId);
    if (!resource || resource.deleted_at || !resource.is_active) {
      throw new NotFoundError('Resource not found or inactive');
    }
    if (resource.business_id !== businessId) {
      throw new BadRequestError('Resource does not belong to this business');
    }
  }

  // Determine duration
  const durationMinutes = options.durationMinutes || service?.duration_minutes || 60;

  // Get business hours
  const openTime = businessHour?.open_time || '09:00';
  const closeTime = businessHour?.close_time || '18:00';

  // Parse times
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const openDateTime = new Date(targetDate);
  openDateTime.setHours(openHour, openMinute, 0, 0);

  const closeDateTime = new Date(targetDate);
  closeDateTime.setHours(closeHour, closeMinute, 0, 0);

  // Get existing bookings for the day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bookingWhere: WhereOptions = {
    business_id: businessId,
    start_at: { [Op.gte]: startOfDay },
    end_at: { [Op.lte]: endOfDay },
    status: {
      [Op.in]: [
        BookingStatus.PENDING,
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.CONFIRMED,
      ],
    },
    deleted_at: { [Op.is]: null } as WhereOptions<typeof Booking.prototype>,
  };

  if (options.resourceId) {
    bookingWhere.resource_id = options.resourceId;
  }

  if (options.serviceId) {
    bookingWhere.service_id = options.serviceId;
  }

  const existingBookings = await Booking.findAll({
    where: bookingWhere,
    order: [['start_at', 'ASC']],
  });

  // Generate time slots
  const slots: TimeSlot[] = [];
  const slotDuration = 15; // 15-minute intervals
  const currentTime = new Date(openDateTime);

  while (currentTime < closeDateTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    // Check if slot extends beyond close time
    if (slotEnd > closeDateTime) {
      break;
    }

    // Check if this slot conflicts with existing bookings
    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.start_at);
      const bookingEnd = new Date(booking.end_at);

      // Add buffer if service has buffers
      if (service) {
        bookingStart.setMinutes(bookingStart.getMinutes() - (service.buffer_before || 0));
        bookingEnd.setMinutes(bookingEnd.getMinutes() + (service.buffer_after || 0));
      }

      // Check overlap
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    // If resource is specified, check if it's available
    let resourceAvailable = true;
    if (resource) {
      // Check if resource is already booked at this time
      const resourceConflict = existingBookings.some((booking) => {
        if (booking.resource_id !== resource.id) {
          return false;
        }
        const bookingStart = new Date(booking.start_at);
        const bookingEnd = new Date(booking.end_at);

        return (
          (currentTime >= bookingStart && currentTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (currentTime <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      resourceAvailable = !resourceConflict;
    }

    slots.push({
      start: new Date(currentTime),
      end: new Date(slotEnd),
      available: !hasConflict && resourceAvailable,
      resourceId: resource?.id,
    });

    // Move to next slot
    currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
  }

  return {
    date: options.date,
    slots,
    businessHours: {
      open: openTime,
      close: closeTime,
      isClosed: false,
    },
  };
}

/**
 * Check if a specific time slot is available
 */
export async function isTimeSlotAvailable(
  businessId: string,
  startAt: Date,
  endAt: Date,
  options: {
    serviceId?: string;
    resourceId?: string;
    excludeBookingId?: string;
  }
): Promise<boolean> {
  // Verify business exists
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Check for conflicting bookings
  const conflictWhere: WhereOptions = {
    business_id: businessId,
    [Op.or]: [
      {
        // Booking starts during our slot
        start_at: { [Op.gte]: startAt, [Op.lt]: endAt },
      },
      {
        // Booking ends during our slot
        end_at: { [Op.gt]: startAt, [Op.lte]: endAt },
      },
      {
        // Booking completely contains our slot
        start_at: { [Op.lte]: startAt },
        end_at: { [Op.gte]: endAt },
      },
    ],
    status: {
      [Op.in]: [
        BookingStatus.PENDING,
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.CONFIRMED,
      ],
    },
    deleted_at: { [Op.is]: null } as WhereOptions<typeof Booking.prototype>,
  };

  if (options.resourceId) {
    conflictWhere.resource_id = options.resourceId;
  }

  if (options.serviceId) {
    conflictWhere.service_id = options.serviceId;
  }

  if (options.excludeBookingId) {
    conflictWhere.id = { [Op.ne]: options.excludeBookingId };
  }

  const conflict = await Booking.findOne({
    where: conflictWhere,
  });

  return !conflict;
}

/**
 * Get available resources for a time slot
 */
export async function getAvailableResources(
  businessId: string,
  startAt: Date,
  endAt: Date,
  serviceId?: string
): Promise<Resource[]> {
  // Verify business exists
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Get all active resources for the business
  const resourceWhere: WhereOptions = {
    business_id: businessId,
    is_active: true,
    deleted_at: { [Op.is]: null } as WhereOptions<typeof Resource.prototype>,
  };

    // If service is provided, get resources linked to the service
    if (serviceId) {
      const service = await Service.findByPk(serviceId, {
        include: [
          {
            model: Resource,
            as: 'resources',
            where: { is_active: true },
            required: false,
          },
        ],
      });

      if (!service || service.deleted_at || !service.is_active) {
        throw new NotFoundError('Service not found or inactive');
      }

      if (service.business_id !== businessId) {
        throw new BadRequestError('Service does not belong to this business');
      }

      // Get resource IDs from service-resource mapping
      const ServiceResource = await import('../models/serviceResource.model').then((m) => m.ServiceResource);
      const serviceResources = await ServiceResource.findAll({
        where: { service_id: serviceId },
        include: [
          {
            model: Resource,
            as: 'resource',
            where: { is_active: true },
          },
        ],
      });
      const resourceIds = serviceResources.map((sr) => sr.resource_id);

    if (resourceIds.length > 0) {
      resourceWhere.id = { [Op.in]: resourceIds };
    } else {
      // No resources linked to service, return empty
      return [];
    }
  }

  const allResources = await Resource.findAll({
    where: resourceWhere,
  });

  // Check which resources are available
  const availableResources: Resource[] = [];

  for (const resource of allResources) {
    const isAvailable = await isTimeSlotAvailable(businessId, startAt, endAt, {
      resourceId: resource.id,
      serviceId,
    });

    if (isAvailable) {
      availableResources.push(resource);
    }
  }

  return availableResources;
}
