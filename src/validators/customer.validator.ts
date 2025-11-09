import { z } from 'zod';
import { uuidSchema, emailSchema, optionalJsonObjectSchema } from '../utils/validators';
import { NoteType } from '../types/enums';

/**
 * Create customer request schema
 */
export const createCustomerSchema = z.object({
  business_id: uuidSchema,
  user_id: uuidSchema.optional(),
  name: z.string().min(1).max(200).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(20).optional(),
  preferences_json: optionalJsonObjectSchema.optional().default({}),
});

export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;

/**
 * Update customer request schema
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(20).optional(),
  preferences_json: optionalJsonObjectSchema.optional(),
});

export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>;

/**
 * Customer query parameters schema
 */
export const customerQuerySchema = z.object({
  business_id: uuidSchema.optional(),
  user_id: uuidSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type CustomerQueryParams = z.infer<typeof customerQuerySchema>;

/**
 * Create customer note request schema
 */
export const createCustomerNoteSchema = z.object({
  customer_id: uuidSchema,
  note_type: z.nativeEnum(NoteType),
  note: z.string().min(1).max(2000),
});

export type CreateCustomerNoteRequest = z.infer<typeof createCustomerNoteSchema>;

/**
 * Update customer note request schema
 */
export const updateCustomerNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});

export type UpdateCustomerNoteRequest = z.infer<typeof updateCustomerNoteSchema>;

/**
 * Customer note query parameters schema
 */
export const customerNoteQuerySchema = z.object({
  customer_id: uuidSchema.optional(),
  note_type: z.nativeEnum(NoteType).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type CustomerNoteQueryParams = z.infer<typeof customerNoteQuerySchema>;

