/**
 * Invoice Routes
 * API endpoints for invoice management
 */

import { Router } from 'express';
import {
  createInvoiceFromBookingController,
  createInvoiceController,
  getInvoiceController,
  listInvoicesController,
  updateInvoiceStatusController,
  regenerateInvoicePDFController,
  downloadInvoicePDFController,
} from '../controllers/invoice.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createInvoiceFromBookingSchema,
  createInvoiceSchema,
  invoiceQuerySchema,
  updateInvoiceStatusSchema,
} from '../validators/invoice.validator';
import { z } from 'zod';

const router = Router();

// Schema definitions
const bookingIdParamSchema = z.object({ bookingId: z.string().uuid() });
const uuidParamSchema = z.object({ id: z.string().uuid() });

/**
 * @route   POST /api/v1/invoices/booking/:bookingId
 * @desc    Create invoice from booking
 * @access  Private
 */
router.post(
  '/booking/:bookingId',
  authGuard,
  validateParams(bookingIdParamSchema),
  validateBody(createInvoiceFromBookingSchema),
  createInvoiceFromBookingController
);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create custom invoice
 * @access  Private
 */
router.post(
  '/',
  authGuard,
  validateBody(createInvoiceSchema),
  createInvoiceController
);

/**
 * @route   GET /api/v1/invoices
 * @desc    List invoices
 * @access  Private
 */
router.get(
  '/',
  authGuard,
  validateQuery(invoiceQuerySchema),
  listInvoicesController
);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get(
  '/:id',
  authGuard,
  validateParams(uuidParamSchema),
  getInvoiceController
);

/**
 * @route   GET /api/v1/invoices/:id/pdf
 * @desc    Download invoice PDF
 * @access  Private
 */
router.get(
  '/:id/pdf',
  authGuard,
  validateParams(uuidParamSchema),
  downloadInvoicePDFController
);

/**
 * @route   PATCH /api/v1/invoices/:id/status
 * @desc    Update invoice status
 * @access  Private
 */
router.patch(
  '/:id/status',
  authGuard,
  validateParams(uuidParamSchema),
  validateBody(updateInvoiceStatusSchema),
  updateInvoiceStatusController
);

/**
 * @route   POST /api/v1/invoices/:id/regenerate-pdf
 * @desc    Regenerate invoice PDF
 * @access  Private
 */
router.post(
  '/:id/regenerate-pdf',
  authGuard,
  validateParams(uuidParamSchema),
  regenerateInvoicePDFController
);

export default router;

