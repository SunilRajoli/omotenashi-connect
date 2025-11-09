/**
 * Service Controller
 * HTTP handlers for service endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  createService,
  listServices,
  getServiceById,
  updateService,
  deleteService,
} from '../services/serviceCatalog.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { ServiceQueryParams } from '../validators/service.validator';

/**
 * Create a new service
 * POST /api/v1/owner/services
 */
export async function createServiceController(
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

    const service = await createService(req.body.business_id, req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: service,
      message: getSuccessMessage('service.created', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * List services
 * GET /api/v1/services
 */
export async function listServicesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as ServiceQueryParams;

    const result = await listServices(
      query,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: {
        services: result.services,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
      message: getSuccessMessage('service.list', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get service by ID
 * GET /api/v1/services/:id
 */
export async function getServiceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const service = await getServiceById(
      id,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: service,
      message: getSuccessMessage('service.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Update service
 * PUT /api/v1/owner/services/:id
 */
export async function updateServiceController(
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

    const service = await updateService(id, req.user.id, req.body);

    res.json({
      success: true,
      data: service,
      message: getSuccessMessage('service.updated', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Delete service
 * DELETE /api/v1/owner/services/:id
 */
export async function deleteServiceController(
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

    await deleteService(id, req.user.id);

    res.json({
      success: true,
      message: getSuccessMessage('service.deleted', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}




