/**
 * Audit Controller
 * Handles audit log-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  listAuditLogs,
  getAuditLogById,
  getEntityAuditLogs,
} from '../services/audit.service';
import { getSuccessMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

/**
 * List audit logs
 * GET /api/v1/audit
 */
export async function listAuditLogsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as {
      entity?: string;
      entity_id?: string;
      actor_user_id?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    };
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { logs, total, page, limit } = await listAuditLogs(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { logs, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get audit log by ID
 * GET /api/v1/audit/:id
 */
export async function getAuditLogController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const log = await getAuditLogById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { log },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get audit logs for an entity
 * GET /api/v1/audit/entity/:entity/:entityId
 */
export async function getEntityAuditLogsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { entity, entityId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const logs = await getEntityAuditLogs(entity, entityId, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
}

