/**
 * Feature Flag Controller
 * Handles feature flag-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createFeatureFlag,
  listFeatureFlags,
  getFeatureFlagById,
  getFeatureFlagByName,
  updateFeatureFlag,
  deleteFeatureFlag,
} from '../services/featureFlag.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
  FeatureFlagQueryParams,
} from '../validators/featureFlag.validator';

/**
 * Create feature flag
 * POST /api/v1/feature-flags
 */
export async function createFeatureFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateFeatureFlagRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const flag = await createFeatureFlag(data, userId, userRole);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { flag },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List feature flags
 * GET /api/v1/feature-flags
 */
export async function listFeatureFlagsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as FeatureFlagQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { flags, total, page, limit } = await listFeatureFlags(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { flags, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get feature flag by ID
 * GET /api/v1/feature-flags/:id
 */
export async function getFeatureFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const flag = await getFeatureFlagById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { flag },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check feature flag by name
 * GET /api/v1/feature-flags/check/:name
 */
export async function checkFeatureFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { name } = req.params;
    const userId = req.user?.id;
    const businessId = req.user?.businessId;

    const isEnabled = await getFeatureFlagByName(name, userId, businessId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { name, isEnabled },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update feature flag
 * PUT /api/v1/feature-flags/:id
 */
export async function updateFeatureFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateFeatureFlagRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const flag = await updateFeatureFlag(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { flag },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete feature flag
 * DELETE /api/v1/feature-flags/:id
 */
export async function deleteFeatureFlagController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteFeatureFlag(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

