/**
 * Resource Routes
 * Resource management endpoints
 */

import { Router } from 'express';
import {
  createResourceController,
  listResourcesController,
  getResourceController,
  updateResourceController,
  deleteResourceController,
} from '../controllers/resource.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
} from '../validators/service.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/v1/owner/resources
 * @desc    Create a new resource
 * @access  Private (Owner/Admin)
 */
router.post(
  '/resources',
  authGuard,
  standardRateLimit,
  validateBody(createResourceSchema),
  createResourceController
);

/**
 * @route   GET /api/v1/resources
 * @desc    List resources
 * @access  Public
 */
router.get(
  '/resources',
  standardRateLimit,
  validateQuery(resourceQuerySchema),
  listResourcesController
);

/**
 * @route   GET /api/v1/resources/:id
 * @desc    Get resource by ID
 * @access  Public
 */
router.get(
  '/resources/:id',
  standardRateLimit,
  getResourceController
);

/**
 * @route   PUT /api/v1/owner/resources/:id
 * @desc    Update resource
 * @access  Private (Owner/Admin)
 */
router.put(
  '/resources/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateResourceSchema),
  updateResourceController
);

/**
 * @route   DELETE /api/v1/owner/resources/:id
 * @desc    Delete resource
 * @access  Private (Owner/Admin)
 */
router.delete(
  '/resources/:id',
  authGuard,
  standardRateLimit,
  deleteResourceController
);

export default router;


