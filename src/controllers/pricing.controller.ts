/**
 * Pricing Controller
 * Handles pricing rule-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getPricingRules,
  getPricePreview,
} from '../services/pricing.service';
import { PricingModifierType, PricingPriority } from '../models/pricingRule.model';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { CreatePricingRuleRequest, UpdatePricingRuleRequest, PricePreviewRequest } from '../validators/pricing.validator';

/**
 * Create pricing rule
 * POST /api/v1/services/:id/pricing-rules
 */
export async function createPricingRuleController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as CreatePricingRuleRequest;
    const locale = getLocale(req);

    // Parse dates if provided and convert enums
    const ruleData = {
      name: data.name,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      price_modifier: data.price_modifier,
      modifier_type: data.modifier_type as PricingModifierType,
      priority: data.priority ? (data.priority as PricingPriority) : undefined,
      metadata: data.metadata,
    };

    const rule = await createPricingRule(id, ruleData);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('pricing_rule_created', locale),
      data: rule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pricing rules for service
 * GET /api/v1/services/:id/pricing-rules
 */
export async function getPricingRulesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    const rules = await getPricingRules(id);

    res.status(200).json({
      status: 'success',
      message: getMessage('pricing_rules_retrieved', locale),
      data: rules,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update pricing rule
 * PUT /api/v1/pricing-rules/:id
 */
export async function updatePricingRuleController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as UpdatePricingRuleRequest;
    const locale = getLocale(req);

    // Parse dates if provided and convert enums
    const updateData: Partial<{
      name: string;
      day_of_week: number[];
      start_time: string;
      end_time: string;
      start_date: Date;
      end_date: Date;
      price_modifier: number;
      modifier_type: PricingModifierType;
      priority: PricingPriority;
      is_active: boolean;
      metadata: Record<string, unknown>;
    }> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.day_of_week !== undefined) updateData.day_of_week = data.day_of_week;
    if (data.start_time !== undefined) updateData.start_time = data.start_time;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    if (data.start_date !== undefined) updateData.start_date = new Date(data.start_date);
    if (data.end_date !== undefined) updateData.end_date = new Date(data.end_date);
    if (data.price_modifier !== undefined) updateData.price_modifier = data.price_modifier;
    if (data.modifier_type !== undefined) updateData.modifier_type = data.modifier_type as PricingModifierType;
    if (data.priority !== undefined) updateData.priority = data.priority as PricingPriority;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const rule = await updatePricingRule(id, updateData);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('pricing_rule_updated', locale),
      data: rule,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete pricing rule
 * DELETE /api/v1/pricing-rules/:id
 */
export async function deletePricingRuleController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    await deletePricingRule(id);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('pricing_rule_deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get price preview
 * POST /api/v1/pricing/preview
 */
export async function getPricePreviewController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as PricePreviewRequest;
    const locale = getLocale(req);

    const bookingDate = new Date(data.booking_date);
    const [hours, minutes] = data.booking_time.split(':').map(Number);
    const bookingTime = new Date(bookingDate);
    bookingTime.setHours(hours, minutes, 0, 0);

    const preview = await getPricePreview(data.service_id, bookingDate, bookingTime);

    res.status(200).json({
      status: 'success',
      message: getMessage('price_preview_retrieved', locale),
      data: preview,
    });
  } catch (error) {
    next(error);
  }
}

