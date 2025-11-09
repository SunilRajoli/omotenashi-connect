/**
 * Review Controller
 * Handles review-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createReview,
  listReviews,
  getReviewById,
  updateReview,
  moderateReview,
  respondToReview,
  deleteReview,
  getBusinessReviewStats,
} from '../services/review.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ModerateReviewRequest,
  RespondToReviewRequest,
  ReviewQueryParams,
} from '../validators/review.validator';

/**
 * Create review
 * POST /api/v1/reviews
 */
export async function createReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateReviewRequest = req.body;
    const userId = req.user?.id;

    const review = await createReview(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List reviews
 * GET /api/v1/reviews
 */
export async function listReviewsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as ReviewQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { reviews, total, page, limit } = await listReviews(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { reviews, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get review by ID
 * GET /api/v1/reviews/:id
 */
export async function getReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const review = await getReviewById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update review
 * PUT /api/v1/reviews/:id
 */
export async function updateReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateReviewRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const review = await updateReview(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Moderate review
 * POST /api/v1/reviews/:id/moderate
 */
export async function moderateReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: ModerateReviewRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const review = await moderateReview(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('moderated', locale),
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Respond to review
 * POST /api/v1/reviews/:id/respond
 */
export async function respondToReviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: RespondToReviewRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const review = await respondToReview(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('responded', locale),
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete review
 * DELETE /api/v1/reviews/:id
 */
export async function deleteReviewController(
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

    await deleteReview(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get business review statistics
 * GET /api/v1/businesses/:businessId/reviews/stats
 */
export async function getBusinessReviewStatsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { businessId } = req.params;

    const stats = await getBusinessReviewStats(businessId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

