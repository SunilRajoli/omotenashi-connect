/**
 * Resource Service
 * Handles resource management (rooms, equipment, staff, etc.)
 */

import { Op, WhereOptions } from 'sequelize';
import { Resource, ResourceType } from '../models/resource.model';
import { Business } from '../models/business.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { CreateResourceRequest, UpdateResourceRequest, ResourceQueryParams } from '../validators/service.validator';

/**
 * Create a new resource
 */
export async function createResource(
  businessId: string,
  ownerId: string,
  data: CreateResourceRequest
): Promise<Resource> {
  // Verify business exists and user owns it
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  if (business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only create resources for your own businesses');
  }

  // Create resource
  const resource = await Resource.create({
    business_id: businessId,
    type: data.type as ResourceType,
    name: data.name,
    capacity: data.capacity || 1,
    attributes_json: data.attributes_json || {},
    is_active: data.is_active !== false,
  });

  logger.info({ resourceId: resource.id, businessId, ownerId }, 'Resource created');

  return resource;
}

/**
 * List resources with filters
 */
export async function listResources(
  query: ResourceQueryParams,
  requesterId?: string,
  requesterRole?: string
): Promise<{ resources: Resource[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};
  const whereDeleted: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  // Apply filters
  if (query.business_id) {
    where.business_id = query.business_id;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.is_active !== undefined) {
    where.is_active = query.is_active;
  } else {
    // Default to active resources only for public
    if (requesterRole === 'customer' || !requesterRole) {
      where.is_active = true;
    }
  }

  // Search filter
  if (query.search) {
    const searchWhere: WhereOptions = {
      name: { [Op.iLike]: `%${query.search}%` },
    };
    Object.assign(where, searchWhere);
  }

  // Role-based filtering
  if (requesterRole === 'owner' && requesterId && query.business_id) {
    // Verify owner owns the business
    const business = await Business.findByPk(query.business_id);
    if (!business || business.owner_id !== requesterId) {
      throw new ForbiddenError('You can only access resources from your own businesses');
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Resource.findAndCountAll({
    where: { ...where, ...whereDeleted },
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug', 'owner_id'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    resources: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get resource by ID
 */
export async function getResourceById(
  resourceId: string,
  requesterId?: string,
  requesterRole?: string
): Promise<Resource> {
  const resource = await Resource.findByPk(resourceId, {
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug', 'owner_id'] },
    ],
  });

  if (!resource || resource.deleted_at) {
    throw new NotFoundError('Resource not found');
  }

  // Access control
  if (requesterRole === 'owner' && requesterId) {
    const business = await Business.findByPk(resource.business_id);
    if (!business || business.owner_id !== requesterId) {
      throw new ForbiddenError('You can only access resources from your own businesses');
    }
  }

  // Public can only see active resources
  if (requesterRole === 'customer' || !requesterRole) {
    if (!resource.is_active) {
      throw new NotFoundError('Resource not found');
    }
  }

  return resource;
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  ownerId: string,
  data: UpdateResourceRequest
): Promise<Resource> {
  const resource = await Resource.findByPk(resourceId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!resource || resource.deleted_at) {
    throw new NotFoundError('Resource not found');
  }

  // Only owner can update
  const business = resource.get('business') as Business;
  if (!business || business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only update resources from your own businesses');
  }

  // Update resource
  await resource.update({
    type: data.type as ResourceType,
    name: data.name,
    capacity: data.capacity,
    attributes_json: data.attributes_json,
    is_active: data.is_active,
  });

  logger.info({ resourceId, ownerId }, 'Resource updated');

  return resource.reload();
}

/**
 * Delete resource (soft delete)
 */
export async function deleteResource(
  resourceId: string,
  ownerId: string
): Promise<void> {
  const resource = await Resource.findByPk(resourceId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!resource || resource.deleted_at) {
    throw new NotFoundError('Resource not found');
  }

  // Only owner can delete
  const business = resource.get('business') as Business;
  if (!business || business.owner_id !== ownerId) {
    throw new ForbiddenError('You can only delete resources from your own businesses');
  }

  // Soft delete
  await resource.update({ deleted_at: new Date() });

  logger.info({ resourceId, ownerId }, 'Resource deleted');
}




