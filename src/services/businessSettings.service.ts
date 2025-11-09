/**
 * Business Settings Service
 * Handles business settings management
 */

import { BusinessSettings } from '../models/businessSettings.model';
import { Business } from '../models/business.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { BusinessSettingsRequest } from '../validators/business.validator';

/**
 * Update business settings
 */
export async function updateBusinessSettings(
  businessId: string,
  ownerId: string,
  data: BusinessSettingsRequest
): Promise<BusinessSettings> {
  // Verify business exists and user owns it
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only update settings for your own businesses');
  }

  // Get or create settings
  let settings = await BusinessSettings.findOne({
    where: { business_id: businessId },
  });

  if (!settings) {
    settings = await BusinessSettings.create({
      business_id: businessId,
      default_locale: 'ja',
      theme_json: {},
    });
  }

  // Update settings
  await settings.update({
    logo_url: data.logo_url,
    primary_color: data.primary_color,
    secondary_color: data.secondary_color,
    font_family: data.font_family,
    default_locale: data.default_locale,
    domain: data.domain,
    theme_json: data.theme_json,
  });

  logger.info({ businessId, ownerId }, 'Business settings updated');

  return settings.reload();
}

/**
 * Get business settings
 */
export async function getBusinessSettings(
  businessId: string
): Promise<BusinessSettings> {
  const business = await Business.findByPk(businessId);

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  let settings = await BusinessSettings.findOne({
    where: { business_id: businessId },
  });

  // Create default settings if not found
  if (!settings) {
    settings = await BusinessSettings.create({
      business_id: businessId,
      default_locale: 'ja',
      theme_json: {},
    });
  }

  return settings;
}


