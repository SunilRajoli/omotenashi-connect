/**
 * Audit Service
 * Handles audit logging for compliance and tracking
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { AuditLog } from '../models/auditLog.model';
import { User, UserRole } from '../models/user.model';
import { NotFoundError, ForbiddenError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

export interface AuditLogData {
  actor_user_id?: string;
  actor_role?: UserRole;
  entity: string;
  entity_id?: string;
  action: string;
  before_json?: Record<string, unknown>;
  after_json?: Record<string, unknown>;
  ip?: string;
  ua?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  data: AuditLogData,
  transaction?: Transaction
): Promise<AuditLog> {
  try {
    const auditLog = await AuditLog.create(
      {
        actor_user_id: data.actor_user_id,
        actor_role: data.actor_role,
        entity: data.entity,
        entity_id: data.entity_id,
        action: data.action,
        before_json: data.before_json,
        after_json: data.after_json,
        ip: data.ip,
        ua: data.ua,
      },
      { transaction }
    );

    logger.debug({ auditLogId: auditLog.id, entity: data.entity, action: data.action }, 'Audit log created');

    return auditLog;
  } catch (error) {
    logger.error({ error, data }, 'Failed to create audit log');
    // Don't throw - audit logging should not break the main flow
    throw error;
  }
}

/**
 * List audit logs
 */
export async function listAuditLogs(
  query: {
    entity?: string;
    entity_id?: string;
    actor_user_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  },
  userId?: string,
  userRole?: string
): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.entity) {
    where.entity = query.entity;
  }
  if (query.entity_id) {
    where.entity_id = query.entity_id;
  }
  if (query.actor_user_id) {
    where.actor_user_id = query.actor_user_id;
  }
  if (query.action) {
    where.action = query.action;
  }

  // Date range filter
  if (query.start_date || query.end_date) {
    const dateFilter: { [Op.gte]?: Date; [Op.lte]?: Date } = {};
    if (query.start_date) {
      dateFilter[Op.gte] = new Date(`${query.start_date}T00:00:00Z`);
    }
    if (query.end_date) {
      dateFilter[Op.lte] = new Date(`${query.end_date}T23:59:59Z`);
    }
    where.created_at = dateFilter;
  }

  // Access control: non-admin users can only see their own audit logs
  if (userRole !== 'admin' && userId) {
    where.actor_user_id = userId;
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [
      { model: User, as: 'actor', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    logs: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(
  logId: string,
  userId?: string,
  userRole?: string
): Promise<AuditLog> {
  const log = await AuditLog.findByPk(logId, {
    include: [
      { model: User, as: 'actor', attributes: ['id', 'email', 'display_name'] },
    ],
  });

  if (!log) {
    throw new Error('Audit log not found');
  }

  // Access control: non-admin users can only see their own audit logs
  if (userRole !== 'admin' && userId) {
    if (log.actor_user_id !== userId) {
      throw new Error('You can only view your own audit logs');
    }
  }

  return log;
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entity: string,
  entityId: string,
  userId?: string,
  userRole?: string
): Promise<AuditLog[]> {
  const where: WhereOptions = {
    entity,
    entity_id: entityId,
  };

  // Access control: non-admin users can only see their own audit logs
  if (userRole !== 'admin' && userId) {
    where.actor_user_id = userId;
  }

  const logs = await AuditLog.findAll({
    where,
    include: [
      { model: User, as: 'actor', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 100,
  });

  return logs;
}

