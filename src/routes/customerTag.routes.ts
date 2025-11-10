/**
 * Customer Tag Routes
 * API routes for customer tagging
 */

import { Router } from 'express';
import { z } from 'zod';
import {
  addTagController,
  removeTagController,
  listTagsController,
  getCustomerTagsController,
  processAutoTaggingController,
} from '../controllers/customerTag.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createTagSchema,
  tagQuerySchema,
  processAutoTaggingSchema,
} from '../validators/customerTag.validator';

// Define UUID param schema inline
const uuidParamSchema = (paramName: string) => z.object({
  [paramName]: z.string().uuid(),
});

const router = Router();

// All routes require authentication
router.use(authGuard);

// Add tag to customer
router.post(
  '/',
  validateBody(createTagSchema),
  addTagController
);

// Remove tag from customer
router.delete(
  '/:tagId',
  validateParams(uuidParamSchema('tagId')),
  removeTagController
);

// List tags
router.get(
  '/',
  validateQuery(tagQuerySchema),
  listTagsController
);

// Get customer tags
router.get(
  '/customer/:customerId',
  validateParams(uuidParamSchema('customerId')),
  getCustomerTagsController
);

// Process auto-tagging
router.post(
  '/business/:businessId/auto-tag',
  validateParams(uuidParamSchema('businessId')),
  validateBody(processAutoTaggingSchema),
  processAutoTaggingController
);

export default router;

