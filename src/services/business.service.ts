/**
 * Business Service
 * Handles business management, creation, updates, and queries
 */

import { Op, WhereOptions } from 'sequelize';
import { Business, BusinessStatus, OnboardingStatus } from '../models/business.model';
import { BusinessSettings } from '../models/businessSettings.model';
import { Vertical } from '../models/vertical.model';
import { User } from '../models/user.model';
import { Service } from '../models/service.model';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { CreateBusinessRequest, UpdateBusinessRequest, BusinessQueryParams } from '../validators/business.validator';
import { sendBusinessCreated, sendBusinessApproved } from './email.service';
import { Locale } from '../types/enums';
import { env } from '../config/env';

/**
 * Create a new business
 */
export async function createBusiness(
  ownerId: string,
  data: CreateBusinessRequest
): Promise<Business> {
  // Check if slug already exists
  const existingBusiness = await Business.findOne({
    where: { slug: data.slug },
  });

  if (existingBusiness) {
    throw new ConflictError('Business with this slug already exists');
  }

  // Verify owner exists
  const owner = await User.findByPk(ownerId);
  if (!owner || owner.deleted_at || owner.role !== 'owner') {
    throw new NotFoundError('Owner not found or invalid');
  }

  // Verify vertical if provided
  if (data.vertical_id) {
    const vertical = await Vertical.findByPk(data.vertical_id);
    if (!vertical) {
      throw new NotFoundError('Vertical not found');
    }
  }

  // Create business
  const business = await Business.create({
    owner_id: ownerId,
    vertical_id: data.vertical_id,
    slug: data.slug,
    display_name_ja: data.display_name_ja,
    display_name_en: data.display_name_en,
    name_kana: data.name_kana,
    description_ja: data.description_ja,
    description_en: data.description_en,
    postal_code: data.postal_code,
    prefecture: data.prefecture,
    city: data.city,
    street: data.street,
    building: data.building,
    phone: data.phone,
    email: data.email,
    timezone: data.timezone || 'Asia/Tokyo',
    status: BusinessStatus.PENDING_REVIEW,
    onboarding_status: OnboardingStatus.INCOMPLETE,
  });

  // Create default business settings
  await BusinessSettings.create({
    business_id: business.id,
    default_locale: 'ja',
  });

  // Send email notification to owner
  try {
    const owner = await User.findByPk(ownerId);
    if (owner && owner.email) {
      const ownerName = owner.display_name || owner.given_name || owner.email;
      const businessName = business.display_name_ja || business.display_name_en || business.slug;
      // Get locale from business settings (default to ja)
      const settings = await BusinessSettings.findOne({
        where: { business_id: business.id },
      });
      const locale = (settings?.default_locale as Locale) || Locale.JA;
      const statusText = locale === Locale.JA ? '審査待ち' : 'Pending Review';
      const dashboardUrl = `${env.APP_URL || 'http://localhost:4000'}/owner/dashboard`;

      await sendBusinessCreated(owner.email, locale, {
        ownerName,
        businessName,
        businessSlug: business.slug,
        businessStatus: statusText,
        dashboardUrl,
      });
    }
  } catch (error) {
    // Log error but don't fail business creation
    logger.error({ error, businessId: business.id }, 'Failed to send business creation email');
  }

  logger.info({ businessId: business.id, ownerId }, 'Business created');

  return business;
}

/**
 * List businesses with filters
 */
export async function listBusinesses(
  query: BusinessQueryParams,
  requesterId?: string,
  requesterRole?: string
): Promise<{ businesses: Business[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};
  const whereDeleted: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  // Apply filters
  if (query.status) {
    where.status = query.status;
  }

  if (query.onboarding_status) {
    where.onboarding_status = query.onboarding_status;
  }

  if (query.vertical_id) {
    where.vertical_id = query.vertical_id;
  }

  if (query.owner_id) {
    where.owner_id = query.owner_id;
  }

  // Search filter
  if (query.search) {
    const searchWhere: WhereOptions = {
      [Op.or]: [
        { display_name_ja: { [Op.iLike]: `%${query.search}%` } },
        { display_name_en: { [Op.iLike]: `%${query.search}%` } },
        { slug: { [Op.iLike]: `%${query.search}%` } },
        { description_ja: { [Op.iLike]: `%${query.search}%` } },
        { description_en: { [Op.iLike]: `%${query.search}%` } },
      ],
    };
    Object.assign(where, searchWhere);
  }

  // Role-based filtering
  if (requesterRole === 'owner' && requesterId) {
    // Owners can only see their own businesses
    where.owner_id = requesterId;
  } else if (requesterRole === 'customer' || !requesterRole) {
    // Customers/public can only see approved businesses
    where.status = BusinessStatus.APPROVED;
    where.onboarding_status = OnboardingStatus.LIVE;
  }
  // Admins can see all businesses

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Business.findAndCountAll({
    where: { ...where, ...whereDeleted },
    include: [
      { model: Vertical, as: 'vertical', attributes: ['id', 'name_ja', 'name_en', 'slug'] },
      { model: User, as: 'owner', attributes: ['id', 'email', 'display_name'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    businesses: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get business by ID
 */
export async function getBusinessById(
  businessId: string,
  requesterId?: string,
  requesterRole?: string
): Promise<Business> {
  const business = await Business.findByPk(businessId, {
    include: [
      { model: Vertical, as: 'vertical', attributes: ['id', 'name_ja', 'name_en', 'slug'] },
      { model: User, as: 'owner', attributes: ['id', 'email', 'display_name'] },
      { model: BusinessSettings, as: 'settings' },
    ],
  });

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Access control
  if (requesterRole === 'owner' && business.owner_id !== requesterId) {
    throw new ForbiddenError('You can only access your own businesses');
  }

  if (requesterRole === 'customer' || !requesterRole) {
    // Customers/public can only see approved businesses
    if (business.status !== BusinessStatus.APPROVED || business.onboarding_status !== OnboardingStatus.LIVE) {
      throw new NotFoundError('Business not found');
    }
  }

  return business;
}

/**
 * Get business by slug
 */
export async function getBusinessBySlug(slug: string): Promise<Business> {
  const whereSlug: WhereOptions = {
    slug,
    status: BusinessStatus.APPROVED,
    onboarding_status: OnboardingStatus.LIVE,
    deleted_at: { [Op.is]: null } as WhereOptions<typeof Business.prototype>,
  };

  const business = await Business.findOne({
    where: whereSlug,
    include: [
      { model: Vertical, as: 'vertical', attributes: ['id', 'name_ja', 'name_en', 'slug'] },
      { model: BusinessSettings, as: 'settings' },
    ],
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  return business;
}

/**
 * Update business
 */
export async function updateBusiness(
  businessId: string,
  ownerId: string,
  data: UpdateBusinessRequest
): Promise<Business> {
  const business = await Business.findByPk(businessId);

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Only owner can update
  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only update your own businesses');
  }

  // Update business
  await business.update({
    display_name_ja: data.display_name_ja,
    display_name_en: data.display_name_en,
    name_kana: data.name_kana,
    description_ja: data.description_ja,
    description_en: data.description_en,
    postal_code: data.postal_code,
    prefecture: data.prefecture,
    city: data.city,
    street: data.street,
    building: data.building,
    phone: data.phone,
    email: data.email,
    timezone: data.timezone,
  });

  logger.info({ businessId, ownerId }, 'Business updated');

  return business.reload();
}

/**
 * Delete business (soft delete)
 */
export async function deleteBusiness(
  businessId: string,
  ownerId: string
): Promise<void> {
  const business = await Business.findByPk(businessId);

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  // Only owner can delete
  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only delete your own businesses');
  }

  // Soft delete
  await business.update({ deleted_at: new Date() });

  logger.info({ businessId, ownerId }, 'Business deleted');
}

/**
 * Get business services
 */
export async function getBusinessServices(
  businessId: string,
  includeInactive = false
): Promise<Service[]> {
  const business = await Business.findByPk(businessId);

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  const where: WhereOptions = {
    business_id: businessId,
    deleted_at: { [Op.is]: null },
  };

  if (!includeInactive) {
    where.is_active = true;
  }

  const services = await Service.findAll({
    where,
    order: [['created_at', 'ASC']],
  });

  return services;
}
