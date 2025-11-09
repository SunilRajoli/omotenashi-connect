/**
 * Audit Routes
 * Audit log endpoints
 */

import { Router } from 'express';
import {
  listAuditLogsController,
  getAuditLogController,
  getEntityAuditLogsController,
} from '../controllers/audit.controller';
import { authGuard } from '../middleware/authGuard';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Audit Routes
 */

/**
 * @route   GET /api/v1/audit
 * @desc    List audit logs
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/audit',
  authGuard,
  standardRateLimit,
  listAuditLogsController
);

/**
 * @route   GET /api/v1/audit/:id
 * @desc    Get audit log by ID
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/audit/:id',
  authGuard,
  standardRateLimit,
  getAuditLogController
);

/**
 * @route   GET /api/v1/audit/entity/:entity/:entityId
 * @desc    Get audit logs for an entity
 * @access  Private (User sees own, Admin sees all)
 */
router.get(
  '/audit/entity/:entity/:entityId',
  authGuard,
  standardRateLimit,
  getEntityAuditLogsController
);

export default router;

