/**
 * Media Controller
 * Handles media-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createMedia,
  listMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  reorderMedia,
} from '../services/media.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateMediaRequest,
  UpdateMediaRequest,
  MediaQueryParams,
} from '../validators/media.validator';
import { BadRequestError } from '../utils/httpErrors';

/**
 * Upload and create media
 * POST /api/v1/media
 */
export async function createMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const file = req.file;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        error: getMessage('media.file_required', locale),
      });
      return;
    }

    const data: CreateMediaRequest = {
      business_id: req.body.business_id,
      type: req.body.type as 'image' | 'video',
      caption_ja: req.body.caption_ja,
      caption_en: req.body.caption_en,
      display_order: req.body.display_order ? Number(req.body.display_order) : 0,
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
    };

    const media = await createMedia(data.business_id, file, data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List media
 * GET /api/v1/media
 */
export async function listMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as MediaQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { media, total, page, limit } = await listMedia(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { media, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get media by ID
 * GET /api/v1/media/:id
 */
export async function getMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const media = await getMediaById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update media
 * PUT /api/v1/media/:id
 */
export async function updateMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateMediaRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const media = await updateMedia(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete media
 * DELETE /api/v1/media/:id
 */
export async function deleteMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteMedia(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reorder media
 * POST /api/v1/media/reorder
 */
export async function reorderMediaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { business_id, media_ids } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    if (!business_id || !media_ids || !Array.isArray(media_ids)) {
      res.status(400).json({
        success: false,
        error: getMessage('media.invalid_reorder', locale),
      });
      return;
    }

    const media = await reorderMedia(business_id, media_ids, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('reordered', locale),
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

