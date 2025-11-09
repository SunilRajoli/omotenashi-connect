/**
 * Resource Controller
 * HTTP handlers for resource endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  createResource,
  listResources,
  getResourceById,
  updateResource,
  deleteResource,
} from '../services/resource.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { ResourceQueryParams } from '../validators/service.validator';

/**
 * Create a new resource
 * POST /api/v1/owner/resources
 */
export async function createResourceController(
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

    const resource = await createResource(req.body.business_id, req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: resource,
      message: getSuccessMessage('resource.created', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * List resources
 * GET /api/v1/resources
 */
export async function listResourcesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as ResourceQueryParams;

    const result = await listResources(
      query,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: {
        resources: result.resources,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
      message: getSuccessMessage('resource.list', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get resource by ID
 * GET /api/v1/resources/:id
 */
export async function getResourceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;

    const resource = await getResourceById(
      id,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: resource,
      message: getSuccessMessage('resource.get', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Update resource
 * PUT /api/v1/owner/resources/:id
 */
export async function updateResourceController(
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

    const resource = await updateResource(id, req.user.id, req.body);

    res.json({
      success: true,
      data: resource,
      message: getSuccessMessage('resource.updated', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Delete resource
 * DELETE /api/v1/owner/resources/:id
 */
export async function deleteResourceController(
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

    await deleteResource(id, req.user.id);

    res.json({
      success: true,
      message: getSuccessMessage('resource.deleted', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}




