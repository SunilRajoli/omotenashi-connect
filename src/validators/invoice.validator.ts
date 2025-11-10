/**
 * Invoice Validators
 * Zod schemas for invoice request validation
 */

import { z } from 'zod';
import { InvoiceType, InvoiceStatus } from '../models/invoice.model';

export const createInvoiceFromBookingSchema = z.object({
  type: z.nativeEnum(InvoiceType).optional(),
  billing_address: z.object({
    company_name: z.string().optional(),
    name: z.string().optional(),
    postal_code: z.string().optional(),
    prefecture: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    building: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  notes: z.string().optional(),
  tax_rate: z.number().min(0).max(1).optional(),
});

export const createInvoiceSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  booking_id: z.string().uuid('Invalid booking ID').optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  type: z.nativeEnum(InvoiceType),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      description_ja: z.string().optional(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      unit_price_cents: z.number().int().min(0, 'Unit price must be non-negative'),
      tax_rate: z.number().min(0).max(1).optional(),
    })
  ).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  billing_address: z.object({
    company_name: z.string().optional(),
    name: z.string().optional(),
    postal_code: z.string().optional(),
    prefecture: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    building: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export const invoiceQuerySchema = z.object({
  business_id: z.string().uuid('Invalid business ID').optional(),
  booking_id: z.string().uuid('Invalid booking ID').optional(),
  customer_id: z.string().uuid('Invalid customer ID').optional(),
  type: z.nativeEnum(InvoiceType).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
});

export type CreateInvoiceFromBookingRequest = z.infer<typeof createInvoiceFromBookingSchema>;
export type CreateInvoiceRequest = z.infer<typeof createInvoiceSchema>;
export type InvoiceQueryParams = z.infer<typeof invoiceQuerySchema>;
export type UpdateInvoiceStatusRequest = z.infer<typeof updateInvoiceStatusSchema>;

