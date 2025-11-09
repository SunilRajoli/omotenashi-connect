/**
 * Business Controller
 * HTTP handlers for business endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  createBusiness,
  listBusinesses,
  getBusinessById,
  getBusinessBySlug,
  updateBusiness,
  deleteBusiness,
  getBusinessServices,
} from '../services/business.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { BusinessQueryParams } from '../validators/business.validator';

/**
 * Create a new business
 * POST /api/v1/businesses
 */
export async function createBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const business = await createBusiness(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: business,
      message: getSuccessMessage('business.created', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * List businesses
 * GET /api/v1/businesses
 */
export async function listBusinessesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as BusinessQueryParams;

    const result = await listBusinesses(
      query,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: {
        businesses: result.businesses,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
      message: getSuccessMessage('business.list', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get business by ID
 * GET /api/v1/businesses/:id
 */
export async function getBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const business = await getBusinessById(
      id,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: business,
      message: getSuccessMessage('business.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get business by slug
 * GET /api/v1/businesses/slug/:slug
 */
export async function getBusinessBySlugController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { slug } = req.params;

    const business = await getBusinessBySlug(slug);

    res.json({
      success: true,
      data: business,
      message: getSuccessMessage('business.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Update business
 * PUT /api/v1/businesses/:id
 */
export async function updateBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const business = await updateBusiness(id, req.user.id, req.body);

    res.json({
      success: true,
      data: business,
      message: getSuccessMessage('business.updated', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Delete business
 * DELETE /api/v1/businesses/:id
 */
export async function deleteBusinessController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteBusiness(id, req.user.id);

    res.json({
      success: true,
      message: getSuccessMessage('business.deleted', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get business services
 * GET /api/v1/businesses/:id/services
 */
export async function getBusinessServicesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const includeInactive = req.query.includeInactive === 'true';

    const services = await getBusinessServices(id, includeInactive);

    res.json({
      success: true,
      data: { services },
      message: getSuccessMessage('service.list', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}




