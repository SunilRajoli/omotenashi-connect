/**
 * Business Hours Service
 * Handles business operating hours management
 */

import { Op } from 'sequelize';
import { BusinessHour } from '../models/businessHour.model';
import { Business } from '../models/business.model';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';

export interface BusinessHourInput {
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time: string; // HH:mm format
  close_time: string; // HH:mm format
  is_closed: boolean;
}

/**
 * Update business hours
 */
export async function updateBusinessHours(
  businessId: string,
  ownerId: string,
  hours: BusinessHourInput[]
): Promise<BusinessHour[]> {
  // Verify business exists and user owns it
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only update hours for your own businesses');
  }

  // Validate hours
  if (!Array.isArray(hours) || hours.length === 0) {
    throw new BadRequestError('Business hours are required');
  }

  // Validate day_of_week (0-6)
  for (const hour of hours) {
    if (hour.day_of_week < 0 || hour.day_of_week > 6) {
      throw new BadRequestError('Invalid day_of_week (must be 0-6)');
    }
  }

  // Delete existing hours
  await BusinessHour.destroy({
    where: { business_id: businessId },
  });

  // Create new hours
  const createdHours = await BusinessHour.bulkCreate(
    hours.map((hour) => ({
      business_id: businessId,
      day_of_week: hour.day_of_week,
      open_time: hour.open_time,
      close_time: hour.close_time,
      is_closed: hour.is_closed,
    }))
  );

  logger.info({ businessId, ownerId, hoursCount: createdHours.length }, 'Business hours updated');

  return createdHours;
}

/**
 * Get business hours
 */
export async function getBusinessHours(
  businessId: string
): Promise<BusinessHour[]> {
  const business = await Business.findByPk(businessId);

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  const hours = await BusinessHour.findAll({
    where: { business_id: businessId },
    order: [['day_of_week', 'ASC']],
  });

  return hours;
}


