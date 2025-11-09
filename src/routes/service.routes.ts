/**
 * Service Routes
 * Service catalog endpoints
 */

import { Router } from 'express';
import {
  createServiceController,
  listServicesController,
  getServiceController,
  updateServiceController,
  deleteServiceController,
} from '../controllers/service.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
} from '../validators/service.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   POST /api/v1/owner/services
 * @desc    Create a new service
 * @access  Private (Owner/Admin)
 */
router.post(
  '/services',
  authGuard,
  standardRateLimit,
  validateBody(createServiceSchema),
  createServiceController
);

/**
 * @route   GET /api/v1/services
 * @desc    List services
 * @access  Public
 */
router.get(
  '/services',
  standardRateLimit,
  validateQuery(serviceQuerySchema),
  listServicesController
);

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
router.get(
  '/services/:id',
  standardRateLimit,
  getServiceController
);

/**
 * @route   PUT /api/v1/owner/services/:id
 * @desc    Update service
 * @access  Private (Owner/Admin)
 */
router.put(
  '/services/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateServiceSchema),
  updateServiceController
);

/**
 * @route   DELETE /api/v1/owner/services/:id
 * @desc    Delete service
 * @access  Private (Owner/Admin)
 */
router.delete(
  '/services/:id',
  authGuard,
  standardRateLimit,
  deleteServiceController
);

export default router;


