/**
 * Pricing Service
 * Handles dynamic pricing calculations based on time slots, days, and seasons
 */

import { PricingRule, PricingModifierType, PricingPriority } from '../models/pricingRule.model';
import { Service } from '../models/service.model';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/httpErrors';

/**
 * Calculate final price with pricing rules applied
 */
export async function calculatePriceWithRules(
  serviceId: string,
  basePrice: number,
  bookingDate: Date,
  bookingTime: Date
): Promise<{
  basePrice: number;
  finalPrice: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    modifier: number;
    modifierType: PricingModifierType;
  }>;
  totalModifier: number;
}> {
  const service = await Service.findByPk(serviceId);
  if (!service || !service.price_cents) {
    return {
      basePrice,
      finalPrice: basePrice,
      appliedRules: [],
      totalModifier: 0,
    };
  }

  // Get all active pricing rules for this service
  const rules = await PricingRule.findAll({
    where: {
      service_id: serviceId,
      is_active: true,
    },
    order: [['priority', 'DESC']], // Higher priority first
  });

  let finalPrice = basePrice;
  const appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    modifier: number;
    modifierType: PricingModifierType;
  }> = [];
  let totalModifier = 0;

  // Check each rule to see if it applies
  for (const rule of rules) {
    if (isRuleApplicable(rule, bookingDate, bookingTime)) {
      let modifier = 0;

      if (rule.modifier_type === PricingModifierType.PERCENTAGE) {
        // Percentage modifier
        modifier = Math.floor((basePrice * rule.price_modifier) / 100);
      } else {
        // Fixed modifier
        modifier = rule.price_modifier;
      }

      finalPrice += modifier;
      totalModifier += modifier;

      appliedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        modifier,
        modifierType: rule.modifier_type,
      });

      logger.debug(
        { serviceId, ruleId: rule.id, modifier, finalPrice },
        'Pricing rule applied'
      );
    }
  }

  // Ensure price doesn't go negative
  finalPrice = Math.max(0, finalPrice);

  return {
    basePrice,
    finalPrice,
    appliedRules,
    totalModifier,
  };
}

/**
 * Check if a pricing rule applies to a given booking date/time
 */
function isRuleApplicable(
  rule: PricingRule,
  bookingDate: Date,
  bookingTime: Date
): boolean {
  // Check day of week
  if (rule.day_of_week && rule.day_of_week.length > 0) {
    const dayOfWeek = bookingDate.getDay();
    if (!rule.day_of_week.includes(dayOfWeek)) {
      return false;
    }
  }

  // Check time range
  if (rule.start_time && rule.end_time) {
    const bookingHour = bookingTime.getHours();
    const bookingMinute = bookingTime.getMinutes();
    const bookingTimeMinutes = bookingHour * 60 + bookingMinute;

    const [startHour, startMinute] = rule.start_time.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = rule.end_time.split(':').map(Number);
    const endTimeMinutes = endHour * 60 + endMinute;

    if (bookingTimeMinutes < startTimeMinutes || bookingTimeMinutes >= endTimeMinutes) {
      return false;
    }
  }

  // Check date range (for seasonal pricing)
  if (rule.start_date || rule.end_date) {
    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (rule.start_date) {
      const startDate = new Date(rule.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (bookingDateOnly < startDate) {
        return false;
      }
    }

    if (rule.end_date) {
      const endDate = new Date(rule.end_date);
      endDate.setHours(23, 59, 59, 999);
      if (bookingDateOnly > endDate) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get all pricing rules for a service
 */
export async function getPricingRules(serviceId: string): Promise<PricingRule[]> {
  return PricingRule.findAll({
    where: {
      service_id: serviceId,
      is_active: true,
    },
    order: [['priority', 'DESC'], ['created_at', 'ASC']],
  });
}

/**
 * Create a pricing rule
 */
export async function createPricingRule(
  serviceId: string,
  data: {
    name: string;
    day_of_week?: number[];
    start_time?: string;
    end_time?: string;
    start_date?: Date;
    end_date?: Date;
    price_modifier: number;
    modifier_type: PricingModifierType;
    priority?: PricingPriority;
    metadata?: Record<string, unknown>;
  }
): Promise<PricingRule> {
  const rule = await PricingRule.create({
    service_id: serviceId,
    name: data.name,
    day_of_week: data.day_of_week,
    start_time: data.start_time,
    end_time: data.end_time,
    start_date: data.start_date,
    end_date: data.end_date,
    price_modifier: data.price_modifier,
    modifier_type: data.modifier_type,
    priority: data.priority || PricingPriority.MEDIUM,
    is_active: true,
    metadata: data.metadata || {},
  });

  logger.info({ serviceId, ruleId: rule.id }, 'Pricing rule created');

  return rule;
}

/**
 * Update a pricing rule
 */
export async function updatePricingRule(
  ruleId: string,
  data: Partial<{
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
  }>
): Promise<PricingRule> {
  const rule = await PricingRule.findByPk(ruleId);
  if (!rule) {
    throw new NotFoundError('Pricing rule not found');
  }

  await rule.update(data);

  logger.info({ ruleId: rule.id }, 'Pricing rule updated');

  return rule;
}

/**
 * Delete a pricing rule
 */
export async function deletePricingRule(ruleId: string): Promise<void> {
  const rule = await PricingRule.findByPk(ruleId);
  if (!rule) {
    throw new NotFoundError('Pricing rule not found');
  }

  await rule.destroy();

  logger.info({ ruleId }, 'Pricing rule deleted');
}

/**
 * Get price preview for a specific date/time
 */
export async function getPricePreview(
  serviceId: string,
  bookingDate: Date,
  bookingTime: Date
): Promise<{
  basePrice: number;
  finalPrice: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    modifier: number;
    modifierType: PricingModifierType;
  }>;
  totalModifier: number;
}> {
  const service = await Service.findByPk(serviceId);
  if (!service || !service.price_cents) {
    throw new NotFoundError('Service not found or has no base price');
  }

  return calculatePriceWithRules(serviceId, service.price_cents, bookingDate, bookingTime);
}

