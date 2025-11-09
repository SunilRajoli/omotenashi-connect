/**
 * Service Catalog Service
 * Handles service management, creation, updates, and queries
 */

import { Op, WhereOptions } from 'sequelize';
import { Service } from '../models/service.model';
import { Resource } from '../models/resource.model';
import { ServiceResource } from '../models/serviceResource.model';
import { Business } from '../models/business.model';
import { CancellationPolicy } from '../models/cancellationPolicy.model';
import { User } from '../models/user.model';
import { BusinessSettings } from '../models/businessSettings.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { CreateServiceRequest, UpdateServiceRequest, ServiceQueryParams } from '../validators/service.validator';
import { sendServiceCreated } from './email.service';
import { Locale } from '../types/enums';
import { env } from '../config/env';

/**
 * Create a new service
 */
export async function createService(
  businessId: string,
  ownerId: string,
  data: CreateServiceRequest
): Promise<Service> {
  // Verify business exists and user owns it
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only create services for your own businesses');
  }

  // Verify policy if provided
  if (data.policy_id) {
    const policy = await CancellationPolicy.findByPk(data.policy_id);
    if (!policy) {
      throw new NotFoundError('Cancellation policy not found');
    }
  }

  // Create service
  const service = await Service.create({
    business_id: businessId,
    category: data.category,
    name_en: data.name_en,
    name_ja: data.name_ja,
    description_en: data.description_en,
    description_ja: data.description_ja,
    duration_minutes: data.duration_minutes,
    price_cents: data.price_cents,
    buffer_before: data.buffer_before || 0,
    buffer_after: data.buffer_after || 0,
    policy_id: data.policy_id,
    metadata: data.metadata || {},
    is_active: data.is_active !== false,
  });

  // Link resources if provided
  if (data.resource_ids && data.resource_ids.length > 0) {
    // Verify all resources belong to the business
    const resourceWhere: WhereOptions = {
      id: { [Op.in]: data.resource_ids },
      business_id: businessId,
      deleted_at: { [Op.is]: null } as WhereOptions<typeof Resource.prototype>,
    };
    const resources = await Resource.findAll({
      where: resourceWhere,
    });

    if (resources.length !== data.resource_ids.length) {
      throw new BadRequestError('Some resources not found or do not belong to this business');
    }

    // Create service-resource mappings
    await ServiceResource.bulkCreate(
      data.resource_ids.map((resourceId) => ({
        service_id: service.id,
        resource_id: resourceId,
        is_required: true,
      }))
    );
  }

  // Send email notification to owner
  try {
    const owner = await User.findByPk(ownerId);
    if (owner && owner.email) {
      const ownerName = owner.display_name || owner.given_name || owner.email;
      const businessName = business.display_name_ja || business.display_name_en || business.slug;
      const serviceName = service.name_ja || service.name_en;
      // Get locale from business settings (default to ja)
      const settings = await BusinessSettings.findOne({
        where: { business_id: businessId },
      });
      const locale = (settings?.default_locale as Locale) || Locale.JA;
      const dashboardUrl = `${env.APP_URL || 'http://localhost:4000'}/owner/dashboard`;

      await sendServiceCreated(owner.email, locale, {
        ownerName,
        businessName,
        serviceName,
        serviceId: service.id,
        dashboardUrl,
      });
    }
  } catch (error) {
    // Log error but don't fail service creation
    logger.error({ error, serviceId: service.id }, 'Failed to send service creation email');
  }

  logger.info({ serviceId: service.id, businessId, ownerId }, 'Service created');

  return service.reload({
    include: [
      { model: Resource, as: 'resources', through: { attributes: ['is_required'] } },
      { model: CancellationPolicy, as: 'cancellationPolicy' },
    ],
  });
}

/**
 * List services with filters
 */
export async function listServices(
  query: ServiceQueryParams,
  requesterId?: string,
  requesterRole?: string
): Promise<{ services: Service[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};
  const whereDeleted: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  // Apply filters
  if (query.business_id) {
    where.business_id = query.business_id;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.is_active !== undefined) {
    where.is_active = query.is_active;
  } else {
    // Default to active services only for public
    if (requesterRole === 'customer' || !requesterRole) {
      where.is_active = true;
    }
  }

  // Search filter
  if (query.search) {
    const searchWhere: WhereOptions = {
      [Op.or]: [
        { name_en: { [Op.iLike]: `%${query.search}%` } },
        { name_ja: { [Op.iLike]: `%${query.search}%` } },
        { description_en: { [Op.iLike]: `%${query.search}%` } },
        { description_ja: { [Op.iLike]: `%${query.search}%` } },
      ],
    };
    Object.assign(where, searchWhere);
  }

  // Role-based filtering
  if (requesterRole === 'owner' && requesterId && query.business_id) {
    // Verify owner owns the business
    const business = await Business.findByPk(query.business_id);
    if (!business || business.owner_id !== requesterId) {
      throw new ForbiddenError('You can only access services from your own businesses');
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Service.findAndCountAll({
    where: { ...where, ...whereDeleted },
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      { model: Resource, as: 'resources', through: { attributes: ['is_required'] } },
      { model: CancellationPolicy, as: 'cancellationPolicy' },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    services: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get service by ID
 */
export async function getServiceById(
  serviceId: string,
  requesterId?: string,
  requesterRole?: string
): Promise<Service> {
  const service = await Service.findByPk(serviceId, {
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug', 'owner_id'] },
      { model: Resource, as: 'resources', through: { attributes: ['is_required'] } },
      { model: CancellationPolicy, as: 'cancellationPolicy' },
    ],
  });

  if (!service || service.deleted_at) {
    throw new NotFoundError('Service not found');
  }

  // Access control
  if (requesterRole === 'owner' && requesterId) {
    const business = await Business.findByPk(service.business_id);
    if (!business || business.owner_id !== requesterId) {
      throw new ForbiddenError('You can only access services from your own businesses');
    }
  }

  // Public can only see active services
  if (requesterRole === 'customer' || !requesterRole) {
    if (!service.is_active) {
      throw new NotFoundError('Service not found');
    }
  }

  return service;
}

/**
 * Update service
 */
export async function updateService(
  serviceId: string,
  ownerId: string,
  data: UpdateServiceRequest
): Promise<Service> {
  const service = await Service.findByPk(serviceId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!service || service.deleted_at) {
    throw new NotFoundError('Service not found');
  }

  // Only owner can update
  const business = service.get('business') as Business;
  if (!business || business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only update services from your own businesses');
  }

  // Verify policy if provided
  if (data.policy_id) {
    const policy = await CancellationPolicy.findByPk(data.policy_id);
    if (!policy) {
      throw new NotFoundError('Cancellation policy not found');
    }
  }

  // Update service
  await service.update({
    category: data.category,
    name_en: data.name_en,
    name_ja: data.name_ja,
    description_en: data.description_en,
    description_ja: data.description_ja,
    duration_minutes: data.duration_minutes,
    price_cents: data.price_cents,
    buffer_before: data.buffer_before,
    buffer_after: data.buffer_after,
    policy_id: data.policy_id,
    metadata: data.metadata,
    is_active: data.is_active,
  });

  // Update resource mappings if provided
  if (data.resource_ids !== undefined) {
    // Remove existing mappings
    await ServiceResource.destroy({
      where: { service_id: service.id },
    });

    // Create new mappings
    if (data.resource_ids.length > 0) {
      // Verify all resources belong to the business
      const resourceWhere: WhereOptions = {
        id: { [Op.in]: data.resource_ids },
        business_id: business.id,
        deleted_at: { [Op.is]: null } as WhereOptions<typeof Resource.prototype>,
      };
      const resources = await Resource.findAll({
        where: resourceWhere,
      });

      if (resources.length !== data.resource_ids.length) {
        throw new BadRequestError('Some resources not found or do not belong to this business');
      }

      await ServiceResource.bulkCreate(
        data.resource_ids.map((resourceId) => ({
          service_id: service.id,
          resource_id: resourceId,
          is_required: true,
        }))
      );
    }
  }

  logger.info({ serviceId, ownerId }, 'Service updated');

  return service.reload({
    include: [
      { model: Resource, as: 'resources', through: { attributes: ['is_required'] } },
      { model: CancellationPolicy, as: 'cancellationPolicy' },
    ],
  });
}

/**
 * Delete service (soft delete)
 */
export async function deleteService(
  serviceId: string,
  ownerId: string
): Promise<void> {
  const service = await Service.findByPk(serviceId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!service || service.deleted_at) {
    throw new NotFoundError('Service not found');
  }

  // Only owner can delete
  const business = service.get('business') as Business;
  if (!business || business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only delete services from your own businesses');
  }

  // Soft delete
  await service.update({ deleted_at: new Date() });

  logger.info({ serviceId, ownerId }, 'Service deleted');
}

