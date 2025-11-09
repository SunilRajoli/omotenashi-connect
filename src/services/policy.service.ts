/**
 * Cancellation Policy Service
 * Handles cancellation policy management
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { CancellationPolicy } from '../models/cancellationPolicy.model';
import { Business } from '../models/business.model';
import { Service } from '../models/service.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyQueryParams,
} from '../validators/policy.validator';

/**
 * Create cancellation policy
 */
export async function createPolicy(
  data: CreatePolicyRequest,
  userId: string
): Promise<CancellationPolicy> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control: only owners can create policies
    if (business.owner_id !== userId) {
      throw new ForbiddenError('You can only create policies for your own businesses');
    }

    // If this is set as default, unset other defaults for this business
    if (data.is_default) {
      await CancellationPolicy.update(
        { is_default: false },
        {
          where: {
            business_id: data.business_id,
            deleted_at: { [Op.is]: null },
          } as WhereOptions,
          transaction,
        }
      );
    }

    // Create policy
    const policy = await CancellationPolicy.create(
      {
        business_id: data.business_id,
        name: data.name,
        hours_before: data.hours_before,
        penalty_percent: data.penalty_percent,
        is_default: data.is_default || false,
      },
      { transaction }
    );

    logger.info({ policyId: policy.id, businessId: data.business_id }, 'Cancellation policy created');

    return policy.reload({
      include: [
        { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      ],
      transaction,
    });
  });
}

/**
 * List cancellation policies
 */
export async function listPolicies(
  query: PolicyQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ policies: CancellationPolicy[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.is_default !== undefined) {
    where.is_default = query.is_default;
  }

  // Access control: owners can only see policies for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { policies: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // If business_id is specified, verify it belongs to the user
    if (query.business_id && !businessIds.includes(query.business_id)) {
      throw new ForbiddenError('You can only view policies for your own businesses');
    }

    where.business_id = query.business_id ? query.business_id : { [Op.in]: businessIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await CancellationPolicy.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
    ],
    order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    policies: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get policy by ID
 */
export async function getPolicyById(
  policyId: string,
  userId?: string,
  userRole?: string
): Promise<CancellationPolicy> {
  const policy = await CancellationPolicy.findByPk(policyId, {
    include: [
      { model: Business, as: 'business' },
      { model: Service, as: 'services', attributes: ['id', 'name_ja', 'name_en'] },
    ],
  });

  if (!policy || policy.deleted_at) {
    throw new NotFoundError('Cancellation policy not found');
  }

  // Access control: owners can only see policies for their businesses
  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(policy.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view policies for your own businesses');
    }
  }

  return policy;
}

/**
 * Update cancellation policy
 */
export async function updatePolicy(
  policyId: string,
  data: UpdatePolicyRequest,
  userId: string,
  userRole: string
): Promise<CancellationPolicy> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const policy = await CancellationPolicy.findByPk(policyId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!policy || policy.deleted_at) {
      throw new NotFoundError('Cancellation policy not found');
    }

    // Access control: only owners can update policies
    const business = policy.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only update policies for your own businesses');
      }
    }

    // If setting as default, unset other defaults
    if (data.is_default === true) {
      await CancellationPolicy.update(
        { is_default: false },
        {
          where: {
            business_id: policy.business_id,
            deleted_at: { [Op.is]: null },
            id: { [Op.ne]: policyId },
          } as WhereOptions,
          transaction,
        }
      );
    }

    // Update policy
    await policy.update(
      {
        name: data.name ?? policy.name,
        hours_before: data.hours_before ?? policy.hours_before,
        penalty_percent: data.penalty_percent ?? policy.penalty_percent,
        is_default: data.is_default ?? policy.is_default,
      },
      { transaction }
    );

    logger.info({ policyId, userId }, 'Cancellation policy updated');

    return policy.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Service, as: 'services' },
      ],
      transaction,
    });
  });
}

/**
 * Delete cancellation policy (soft delete)
 */
export async function deletePolicy(
  policyId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const policy = await CancellationPolicy.findByPk(policyId, {
      include: [{ model: Business, as: 'business' }, { model: Service, as: 'services' }],
      transaction,
    });

    if (!policy || policy.deleted_at) {
      throw new NotFoundError('Cancellation policy not found');
    }

    // Access control: only owners can delete policies
    const business = policy.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only delete policies for your own businesses');
      }
    }

    // Check if policy is in use
    const services = policy.get('services') as Service[] | undefined;
    if (services && services.length > 0) {
      throw new ConflictError('Cannot delete policy that is in use by services');
    }

    // Soft delete
    await policy.update(
      {
        deleted_at: new Date(),
      },
      { transaction }
    );

    logger.info({ policyId, userId }, 'Cancellation policy deleted');
  });
}

