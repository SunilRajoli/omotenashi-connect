/**
 * Media Routes
 * Media upload and management endpoints
 */

import { Router } from 'express';
import multer from 'multer';
import { FileFilterCallback } from 'multer';
import {
  createMediaController,
  listMediaController,
  getMediaController,
  updateMediaController,
  deleteMediaController,
  reorderMediaController,
} from '../controllers/media.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createMediaSchema,
  updateMediaSchema,
  mediaQuerySchema,
} from '../validators/media.validator';
import { standardRateLimit } from '../middleware/rateLimit';
import { env } from '../config/env';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Allow images and videos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

/**
 * Media Routes
 */

/**
 * @route   POST /api/v1/media
 * @desc    Upload and create media
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/media',
  authGuard,
  standardRateLimit,
  upload.single('file'),
  validateBody(createMediaSchema),
  createMediaController
);

/**
 * @route   GET /api/v1/media
 * @desc    List media
 * @access  Public (with filters) / Private (with access control)
 */
router.get(
  '/media',
  standardRateLimit,
  validateQuery(mediaQuerySchema),
  listMediaController
);

/**
 * @route   GET /api/v1/media/:id
 * @desc    Get media by ID
 * @access  Public / Private (with access control)
 */
router.get(
  '/media/:id',
  standardRateLimit,
  getMediaController
);

/**
 * @route   PUT /api/v1/media/:id
 * @desc    Update media
 * @access  Private (Owner/Admin only)
 */
router.put(
  '/media/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateMediaSchema),
  updateMediaController
);

/**
 * @route   DELETE /api/v1/media/:id
 * @desc    Delete media
 * @access  Private (Owner/Admin only)
 */
router.delete(
  '/media/:id',
  authGuard,
  standardRateLimit,
  deleteMediaController
);

/**
 * @route   POST /api/v1/media/reorder
 * @desc    Reorder media
 * @access  Private (Owner/Admin only)
 */
router.post(
  '/media/reorder',
  authGuard,
  standardRateLimit,
  reorderMediaController
);

export default router;

