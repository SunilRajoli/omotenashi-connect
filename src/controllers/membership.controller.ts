/**
 * Membership Controller
 * Handles membership-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createMembership,
  getMembership,
  listMemberships,
  updateMembership,
  cancelMembership,
  usePunchCardVisit,
  processRecurringBilling,
  getActiveMembership,
  hasActiveMembership,
  applyMembershipDiscount,
} from '../services/membership.service';
import { MembershipType, MembershipStatus, BillingCycle } from '../models/membership.model';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateMembershipRequest,
  UpdateMembershipRequest,
  MembershipQueryParams,
  UsePunchCardVisitRequest,
  ProcessRecurringBillingRequest,
} from '../validators/membership.validator';

/**
 * Create membership
 * POST /api/v1/memberships
 */
export async function createMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateMembershipRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    // Convert enums from validator types to model enums
    const membershipData = {
      business_id: data.business_id,
      customer_id: data.customer_id,
      membership_type: data.membership_type as MembershipType,
      name: data.name,
      description: data.description,
      price_cents: data.price_cents,
      billing_cycle: data.billing_cycle as BillingCycle | undefined,
      duration_days: data.duration_days,
      visits_included: data.visits_included,
      discount_percentage: data.discount_percentage,
      benefits: data.benefits,
      auto_renew: data.auto_renew,
      metadata: data.metadata,
    };

    const membership = await createMembership(membershipData, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('membership_created', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get membership
 * GET /api/v1/memberships/:id
 */
export async function getMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const membership = await getMembership(id, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('membership_retrieved', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List memberships
 * GET /api/v1/memberships
 */
export async function listMembershipsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as MembershipQueryParams;
    const userId = req.user?.id;
    const locale = getLocale(req);

    // Convert enums from validator types to model enums
    const filters = {
      business_id: query.business_id,
      customer_id: query.customer_id,
      membership_type: query.membership_type ? (query.membership_type as MembershipType) : undefined,
      status: query.status ? (query.status as MembershipStatus) : undefined,
      page: query.page,
      limit: query.limit,
    };

    const result = await listMemberships(filters, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('memberships_retrieved', locale),
      data: result.memberships,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update membership
 * PUT /api/v1/memberships/:id
 */
export async function updateMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as UpdateMembershipRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    // Convert enums from validator types to model enums
    const updateData: Partial<{
      name: string;
      description: string;
      discount_percentage: number;
      benefits: Record<string, unknown>;
      auto_renew: boolean;
      status: MembershipStatus;
      metadata: Record<string, unknown>;
    }> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discount_percentage !== undefined) updateData.discount_percentage = data.discount_percentage;
    if (data.benefits !== undefined) updateData.benefits = data.benefits;
    if (data.auto_renew !== undefined) updateData.auto_renew = data.auto_renew;
    if (data.status !== undefined) updateData.status = data.status as MembershipStatus;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const membership = await updateMembership(id, updateData, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('membership_updated', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel membership
 * POST /api/v1/memberships/:id/cancel
 */
export async function cancelMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const membership = await cancelMembership(id, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('membership_cancelled', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Use punch card visit
 * POST /api/v1/memberships/:id/use-visit
 */
export async function usePunchCardVisitController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as UsePunchCardVisitRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const membership = await usePunchCardVisit(id, data.booking_id, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('punch_card_visit_used', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process recurring billing
 * POST /api/v1/memberships/:id/process-billing
 */
export async function processRecurringBillingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as ProcessRecurringBillingRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    const result = await processRecurringBilling(id, data.payment_intent_id, data.amount_cents, userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('recurring_billing_processed', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get active membership
 * GET /api/v1/memberships/active
 */
export async function getActiveMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { business_id, customer_id } = req.query as { business_id: string; customer_id: string };
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!business_id || !customer_id) {
      res.status(400).json({
        status: 'error',
        message: getMessage('business_id_and_customer_id_required', locale),
      });
      return;
    }

    const membership = await getActiveMembership(business_id, customer_id, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('active_membership_retrieved', locale),
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check active membership
 * GET /api/v1/memberships/check
 */
export async function checkActiveMembershipController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { business_id, customer_id } = req.query as { business_id: string; customer_id: string };
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!business_id || !customer_id) {
      res.status(400).json({
        status: 'error',
        message: getMessage('business_id_and_customer_id_required', locale),
      });
      return;
    }

    const hasActive = await hasActiveMembership(business_id, customer_id, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('membership_status_checked', locale),
      data: { hasActiveMembership: hasActive },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Apply membership discount
 * POST /api/v1/memberships/apply-discount
 */
export async function applyMembershipDiscountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { business_id, customer_id, booking_price_cents } = req.body as {
      business_id: string;
      customer_id: string;
      booking_price_cents: number;
    };
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!business_id || !customer_id || !booking_price_cents) {
      res.status(400).json({
        status: 'error',
        message: getMessage('business_id_customer_id_and_price_required', locale),
      });
    }

    const result = await applyMembershipDiscount(business_id, customer_id, booking_price_cents, userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('membership_discount_applied', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

