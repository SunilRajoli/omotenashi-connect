/**
 * Membership Validator
 * Validation schemas for membership requests
 */

import { z } from 'zod';
import { uuidSchema } from '../utils/validators';

/**
 * Create membership request schema
 */
export const createMembershipSchema = z.object({
  business_id: uuidSchema,
  customer_id: uuidSchema,
  membership_type: z.enum(['subscription', 'package', 'punch_card']),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  price_cents: z.number().int().positive(),
  billing_cycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  duration_days: z.number().int().positive().optional(),
  visits_included: z.number().int().positive().optional(),
  discount_percentage: z.number().int().min(0).max(100).optional(),
  benefits: z.record(z.unknown()).optional(),
  auto_renew: z.boolean().optional().default(true),
  metadata: z.record(z.unknown()).optional(),
}).refine((data) => {
  if (data.membership_type === 'subscription' && !data.billing_cycle) {
    return false;
  }
  return true;
}, {
  message: 'Billing cycle is required for subscription memberships',
  path: ['billing_cycle'],
}).refine((data) => {
  if (data.membership_type === 'package' && !data.duration_days) {
    return false;
  }
  return true;
}, {
  message: 'Duration days is required for package memberships',
  path: ['duration_days'],
}).refine((data) => {
  if (data.membership_type === 'punch_card' && !data.visits_included) {
    return false;
  }
  return true;
}, {
  message: 'Visits included is required for punch card memberships',
  path: ['visits_included'],
});

export type CreateMembershipRequest = z.infer<typeof createMembershipSchema>;

/**
 * Update membership request schema
 */
export const updateMembershipSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  discount_percentage: z.number().int().min(0).max(100).optional(),
  benefits: z.record(z.unknown()).optional(),
  auto_renew: z.boolean().optional(),
  status: z.enum(['active', 'suspended', 'cancelled', 'expired']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateMembershipRequest = z.infer<typeof updateMembershipSchema>;

/**
 * Membership query parameters schema
 */
export const membershipQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  customer_id: uuidSchema.optional(),
  membership_type: z.enum(['subscription', 'package', 'punch_card']).optional(),
  status: z.enum(['active', 'suspended', 'cancelled', 'expired']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type MembershipQueryParams = z.infer<typeof membershipQuerySchema>;

/**
 * Use punch card visit request schema
 */
export const usePunchCardVisitSchema = z.object({
  booking_id: uuidSchema,
});

export type UsePunchCardVisitRequest = z.infer<typeof usePunchCardVisitSchema>;

/**
 * Process recurring billing request schema
 */
export const processRecurringBillingSchema = z.object({
  payment_intent_id: z.string().min(1),
  amount_cents: z.number().int().positive(),
});

export type ProcessRecurringBillingRequest = z.infer<typeof processRecurringBillingSchema>;

