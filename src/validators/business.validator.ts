/**
 * Business validation schemas
 * Zod schemas for business endpoints
 */

import { z } from 'zod';
import {
  uuidSchema,
  slugSchema,
  postalCodeSchema,
  phoneSchema,
  emailSchema,
  optionalJsonObjectSchema,
} from '../utils/validators';
import { BusinessStatus, OnboardingStatus } from '../types/enums';

/**
 * Create business request schema
 */
export const createBusinessSchema = z.object({
  slug: slugSchema,
  display_name_ja: z.string().optional(),
  display_name_en: z.string().optional(),
  name_kana: z.string().optional(),
  description_ja: z.string().optional(),
  description_en: z.string().optional(),
  postal_code: postalCodeSchema.optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  vertical_id: uuidSchema.optional(),
  timezone: z.string().optional().default('Asia/Tokyo'),
});

export type CreateBusinessRequest = z.infer<typeof createBusinessSchema>;

/**
 * Update business request schema
 */
export const updateBusinessSchema = z.object({
  display_name_ja: z.string().optional(),
  display_name_en: z.string().optional(),
  name_kana: z.string().optional(),
  description_ja: z.string().optional(),
  description_en: z.string().optional(),
  postal_code: postalCodeSchema.optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  timezone: z.string().optional(),
});

export type UpdateBusinessRequest = z.infer<typeof updateBusinessSchema>;

/**
 * Business verification request schema
 */
export const businessVerificationSchema = z.object({
  business_id: uuidSchema,
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
});

export type BusinessVerificationRequest = z.infer<typeof businessVerificationSchema>;

/**
 * Business query parameters schema
 */
export const businessQuerySchema = z.object({
  status: z.nativeEnum(BusinessStatus).optional(),
  onboarding_status: z.nativeEnum(OnboardingStatus).optional(),
  vertical_id: uuidSchema.optional(),
  owner_id: uuidSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type BusinessQueryParams = z.infer<typeof businessQuerySchema>;

/**
 * Business settings update schema
 */
export const businessSettingsSchema = z.object({
  logo_url: z.string().url().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  font_family: z.string().optional(),
  default_locale: z.enum(['ja', 'en']).optional(),
  domain: z.string().optional(),
  theme_json: optionalJsonObjectSchema,
});

export type BusinessSettingsRequest = z.infer<typeof businessSettingsSchema>;

