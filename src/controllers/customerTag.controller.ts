/**
 * Customer Tag Controller
 * Handles HTTP requests for customer tagging
 */

import { Request, Response, NextFunction } from 'express';
import {
  addTagToCustomer,
  removeTagFromCustomer,
  listTags,
  getCustomerTags,
  processAutoTagging,
  AutoTagRule,
} from '../services/customerTag.service';
import {
  CreateTagRequest,
  TagQueryParams,
} from '../validators/customerTag.validator';

/**
 * Add tag to customer
 */
export async function addTagController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const data = req.body as CreateTagRequest;

    const tag = await addTagToCustomer(data, userId, userRole);

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove tag from customer
 */
export async function removeTagController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { tagId } = req.params;

    await removeTagFromCustomer(tagId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Tag removed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List tags
 */
export async function listTagsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const query = req.query as unknown as TagQueryParams;

    const result = await listTags(query, userId, userRole);

    res.status(200).json({
      success: true,
      data: result.tags,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get customer tags
 */
export async function getCustomerTagsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { customerId } = req.params;
    const { businessId } = req.query;

    if (!businessId || typeof businessId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'businessId is required',
      });
      return;
    }

    const tags = await getCustomerTags(customerId, businessId, userId, userRole);

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process auto-tagging
 */
export async function processAutoTaggingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { businessId } = req.params;
    const { rules } = req.body as { rules: AutoTagRule[] };

    if (!rules || !Array.isArray(rules)) {
      res.status(400).json({
        success: false,
        error: 'rules array is required',
      });
      return;
    }

    const result = await processAutoTagging(businessId, rules);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

