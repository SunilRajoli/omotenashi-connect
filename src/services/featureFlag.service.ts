/**
 * Feature Flag Service
 * Handles feature flag management
 */

import { Transaction, WhereOptions } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { FeatureFlag } from '../models/featureFlag.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import {
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
  FeatureFlagQueryParams,
} from '../validators/featureFlag.validator';

/**
 * Create feature flag
 */
export async function createFeatureFlag(
  data: CreateFeatureFlagRequest,
  userId: string,
  userRole: string
): Promise<FeatureFlag> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Access control: only admins can create feature flags
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can create feature flags');
    }

    // Check if feature flag with same name already exists
    const existing = await FeatureFlag.findOne({
      where: { name: data.name },
      transaction,
    });

    if (existing) {
      throw new ConflictError('Feature flag with this name already exists');
    }

    // Create feature flag
    const flag = await FeatureFlag.create(
      {
        name: data.name,
        description: data.description,
        is_enabled: data.is_enabled || false,
        rollout_percent: data.rollout_percent || 0,
        target_user_ids: data.target_user_ids || [],
        target_business_ids: data.target_business_ids || [],
      },
      { transaction }
    );

    logger.info({ flagId: flag.id, name: data.name }, 'Feature flag created');

    return flag.reload({ transaction });
  });
}

/**
 * List feature flags
 */
export async function listFeatureFlags(
  query: FeatureFlagQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ flags: FeatureFlag[]; total: number; page: number; limit: number }> {
  // Access control: only admins can list feature flags
  if (userRole !== 'admin') {
    throw new ForbiddenError('Only admins can list feature flags');
  }

  const where: WhereOptions = {};

  if (query.is_enabled !== undefined) {
    where.is_enabled = query.is_enabled;
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await FeatureFlag.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    flags: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get feature flag by ID
 */
export async function getFeatureFlagById(
  flagId: string,
  userId?: string,
  userRole?: string
): Promise<FeatureFlag> {
  // Access control: only admins can view feature flags
  if (userRole !== 'admin') {
    throw new ForbiddenError('Only admins can view feature flags');
  }

  const flag = await FeatureFlag.findByPk(flagId);

  if (!flag) {
    throw new NotFoundError('Feature flag not found');
  }

  return flag;
}

/**
 * Get feature flag by name
 */
export async function getFeatureFlagByName(
  name: string,
  userId?: string,
  businessId?: string
): Promise<boolean> {
  const flag = await FeatureFlag.findOne({
    where: { name },
  });

  if (!flag || !flag.is_enabled) {
    return false;
  }

  // Check rollout percentage
  if (flag.rollout_percent < 100) {
    // Simple hash-based rollout (can be improved)
    const hash = userId ? userId : businessId || 'default';
    const hashValue = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const percentage = (hashValue % 100) + 1;
    if (percentage > flag.rollout_percent) {
      return false;
    }
  }

  // Check target user IDs
  if (flag.target_user_ids.length > 0) {
    if (!userId || !flag.target_user_ids.includes(userId)) {
      return false;
    }
  }

  // Check target business IDs
  if (flag.target_business_ids.length > 0) {
    if (!businessId || !flag.target_business_ids.includes(businessId)) {
      return false;
    }
  }

  return true;
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  flagId: string,
  data: UpdateFeatureFlagRequest,
  userId: string,
  userRole: string
): Promise<FeatureFlag> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Access control: only admins can update feature flags
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can update feature flags');
    }

    const flag = await FeatureFlag.findByPk(flagId, { transaction });

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    // Check name uniqueness if name is being updated
    if (data.name && data.name !== flag.name) {
      const existing = await FeatureFlag.findOne({
        where: { name: data.name },
        transaction,
      });

      if (existing) {
        throw new ConflictError('Feature flag with this name already exists');
      }
    }

    // Update flag
    await flag.update(
      {
        name: data.name ?? flag.name,
        description: data.description ?? flag.description,
        is_enabled: data.is_enabled ?? flag.is_enabled,
        rollout_percent: data.rollout_percent ?? flag.rollout_percent,
        target_user_ids: data.target_user_ids ?? flag.target_user_ids,
        target_business_ids: data.target_business_ids ?? flag.target_business_ids,
      },
      { transaction }
    );

    logger.info({ flagId, userId }, 'Feature flag updated');

    return flag.reload({ transaction });
  });
}

/**
 * Delete feature flag
 */
export async function deleteFeatureFlag(
  flagId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Access control: only admins can delete feature flags
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete feature flags');
    }

    const flag = await FeatureFlag.findByPk(flagId, { transaction });

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    await flag.destroy({ transaction });

    logger.info({ flagId, userId }, 'Feature flag deleted');
  });
}

