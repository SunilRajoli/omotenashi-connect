/**
 * Customer Segment Controller
 * Handles HTTP requests for customer segmentation
 */

import { Request, Response, NextFunction } from 'express';
import {
  createSegment,
  getSegment,
  listSegments,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  recalculateSegmentCount,
  CreateSegmentRequest,
  SegmentQueryParams,
} from '../services/customerSegment.service';

/**
 * Create segment
 */
export async function createSegmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const data = req.body as CreateSegmentRequest;

    const segment = await createSegment(data, userId, userRole);

    res.status(201).json({
      success: true,
      data: segment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get segment
 */
export async function getSegmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { segmentId } = req.params;

    const segment = await getSegment(segmentId, userId, userRole);

    res.status(200).json({
      success: true,
      data: segment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List segments
 */
export async function listSegmentsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const query = req.query as unknown as SegmentQueryParams;

    const result = await listSegments(query, userId, userRole);

    res.status(200).json({
      success: true,
      data: result.segments,
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
 * Update segment
 */
export async function updateSegmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { segmentId } = req.params;
    const data = req.body;

    const segment = await updateSegment(segmentId, data, userId, userRole);

    res.status(200).json({
      success: true,
      data: segment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete segment
 */
export async function deleteSegmentController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { segmentId } = req.params;

    await deleteSegment(segmentId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Segment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get segment customers
 */
export async function getSegmentCustomersController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { segmentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getSegmentCustomers(segmentId, page, limit, userId, userRole);

    res.status(200).json({
      success: true,
      data: result.customers,
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
 * Recalculate segment count
 */
export async function recalculateSegmentCountController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { segmentId } = req.params;

    const segment = await recalculateSegmentCount(segmentId, userId, userRole);

    res.status(200).json({
      success: true,
      data: segment,
    });
  } catch (error) {
    next(error);
  }
}

