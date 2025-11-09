/**
 * Policy Controller
 * Handles cancellation policy-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createPolicy,
  listPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from '../services/policy.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyQueryParams,
} from '../validators/policy.validator';

/**
 * Create cancellation policy
 * POST /api/v1/policies
 */
export async function createPolicyController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreatePolicyRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const policy = await createPolicy(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List cancellation policies
 * GET /api/v1/policies
 */
export async function listPoliciesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as PolicyQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { policies, total, page, limit } = await listPolicies(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { policies, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get cancellation policy by ID
 * GET /api/v1/policies/:id
 */
export async function getPolicyController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const policy = await getPolicyById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update cancellation policy
 * PUT /api/v1/policies/:id
 */
export async function updatePolicyController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdatePolicyRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const policy = await updatePolicy(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { policy },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete cancellation policy
 * DELETE /api/v1/policies/:id
 */
export async function deletePolicyController(
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

    await deletePolicy(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

