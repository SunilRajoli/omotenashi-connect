/**
 * Service validation schemas
 * Zod schemas for service endpoints
 */

import { z } from 'zod';
import {
  uuidSchema,
  optionalJsonObjectSchema,
} from '../utils/validators';

/**
 * Create service request schema
 */
export const createServiceSchema = z.object({
  business_id: uuidSchema,
  category: z.string().optional(),
  name_en: z.string().min(1, 'Service name (English) is required'),
  name_ja: z.string().optional(),
  description_en: z.string().optional(),
  description_ja: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  buffer_before: z.number().int().nonnegative().optional().default(0),
  buffer_after: z.number().int().nonnegative().optional().default(0),
  policy_id: uuidSchema.optional(),
  metadata: optionalJsonObjectSchema,
  is_active: z.boolean().optional().default(true),
  resource_ids: z.array(uuidSchema).optional(),
});

export type CreateServiceRequest = z.infer<typeof createServiceSchema>;

/**
 * Update service request schema
 */
export const updateServiceSchema = z.object({
  category: z.string().optional(),
  name_en: z.string().min(1).optional(),
  name_ja: z.string().optional(),
  description_en: z.string().optional(),
  description_ja: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  buffer_before: z.number().int().nonnegative().optional(),
  buffer_after: z.number().int().nonnegative().optional(),
  policy_id: uuidSchema.optional(),
  metadata: optionalJsonObjectSchema,
  is_active: z.boolean().optional(),
  resource_ids: z.array(uuidSchema).optional(),
});

export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;

/**
 * Service query parameters schema
 */
export const serviceQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type ServiceQueryParams = z.infer<typeof serviceQuerySchema>;

/**
 * Resource validation schemas
 */

/**
 * Create resource request schema
 */
export const createResourceSchema = z.object({
  business_id: uuidSchema,
  type: z.enum(['staff', 'room', 'table', 'trainer']),
  name: z.string().min(1, 'Resource name is required'),
  capacity: z.number().int().positive().optional().default(1),
  attributes_json: optionalJsonObjectSchema,
  is_active: z.boolean().optional().default(true),
});

export type CreateResourceRequest = z.infer<typeof createResourceSchema>;

/**
 * Update resource request schema
 */
export const updateResourceSchema = z.object({
  type: z.enum(['staff', 'room', 'table', 'trainer']).optional(),
  name: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  attributes_json: optionalJsonObjectSchema,
  is_active: z.boolean().optional(),
});

export type UpdateResourceRequest = z.infer<typeof updateResourceSchema>;

/**
 * Resource query parameters schema
 */
export const resourceQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  type: z.enum(['staff', 'room', 'table', 'trainer']).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type ResourceQueryParams = z.infer<typeof resourceQuerySchema>;




