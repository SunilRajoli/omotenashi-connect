/**
 * Admin Controller
 * Handles admin-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  listBusinessesForReview,
  getBusinessForReview,
} from '../services/verification.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  ApproveBusinessRequest,
  RejectBusinessRequest,
  SuspendBusinessRequest,
  AdminBusinessQueryParams,
} from '../validators/admin.validator';

/**
 * Approve business
 * POST /api/v1/admin/businesses/:id/approve
 */
export async function approveBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: ApproveBusinessRequest = { ...req.body, business_id: id };
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const result = await approveBusiness(data, adminId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('approved', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reject business
 * POST /api/v1/admin/businesses/:id/reject
 */
export async function rejectBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: RejectBusinessRequest = { ...req.body, business_id: id };
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const result = await rejectBusiness(data, adminId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('rejected', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Suspend business
 * POST /api/v1/admin/businesses/:id/suspend
 */
export async function suspendBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: SuspendBusinessRequest = { ...req.body, business_id: id };
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const business = await suspendBusiness(data, adminId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('suspended', locale),
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List businesses for review
 * GET /api/v1/admin/businesses
 */
export async function listBusinessesForReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as AdminBusinessQueryParams;

    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const { businesses, total, page, limit } = await listBusinessesForReview(query);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { businesses, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get business for review
 * GET /api/v1/admin/businesses/:id
 */
export async function getBusinessForReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const business = await getBusinessForReview(id);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { business },
    });
  } catch (error) {
    next(error);
  }
}

