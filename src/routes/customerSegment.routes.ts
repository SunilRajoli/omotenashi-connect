/**
 * Customer Segment Routes
 * API routes for customer segmentation
 */

import { Router } from 'express';
import {
  createSegmentController,
  getSegmentController,
  listSegmentsController,
  updateSegmentController,
  deleteSegmentController,
  getSegmentCustomersController,
  recalculateSegmentCountController,
} from '../controllers/customerSegment.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createSegmentSchema,
  updateSegmentSchema,
  segmentQuerySchema,
} from '../validators/customerSegment.validator';
import { z } from 'zod';

// Define UUID param schema inline
const uuidParamSchema = (paramName: string) => z.object({
  [paramName]: z.string().uuid(),
});

const router = Router();

// All routes require authentication
router.use(authGuard);

// Create segment
router.post(
  '/',
  validateBody(createSegmentSchema),
  createSegmentController
);

// Get segment
router.get(
  '/:segmentId',
  validateParams(uuidParamSchema('segmentId')),
  getSegmentController
);

// List segments
router.get(
  '/',
  validateQuery(segmentQuerySchema),
  listSegmentsController
);

// Update segment
router.put(
  '/:segmentId',
  validateParams(uuidParamSchema('segmentId')),
  validateBody(updateSegmentSchema),
  updateSegmentController
);

// Delete segment
router.delete(
  '/:segmentId',
  validateParams(uuidParamSchema('segmentId')),
  deleteSegmentController
);

// Get segment customers
router.get(
  '/:segmentId/customers',
  validateParams(uuidParamSchema('segmentId')),
  getSegmentCustomersController
);

// Recalculate segment count
router.post(
  '/:segmentId/recalculate',
  validateParams(uuidParamSchema('segmentId')),
  recalculateSegmentCountController
);

export default router;

