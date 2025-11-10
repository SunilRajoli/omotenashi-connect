/**
 * Invoice Controller
 * Handles invoice-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createInvoiceFromBooking,
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoiceStatus,
  regenerateInvoicePDF,
} from '../services/invoice.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateInvoiceFromBookingRequest,
  CreateInvoiceRequest,
  InvoiceQueryParams,
  UpdateInvoiceStatusRequest,
} from '../validators/invoice.validator';

/**
 * Create invoice from booking
 * POST /api/v1/invoices/booking/:bookingId
 */
export async function createInvoiceFromBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { bookingId } = req.params;
    const data: CreateInvoiceFromBookingRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await createInvoiceFromBooking(bookingId, data, userId, userRole);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create custom invoice
 * POST /api/v1/invoices
 */
export async function createInvoiceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateInvoiceRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await createInvoice(data, userId, userRole);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get invoice by ID
 * GET /api/v1/invoices/:id
 */
export async function getInvoiceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await getInvoice(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('retrieved', locale),
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List invoices
 * GET /api/v1/invoices
 */
export async function listInvoicesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query: InvoiceQueryParams = req.query as unknown as InvoiceQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await listInvoices(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('retrieved', locale),
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update invoice status
 * PATCH /api/v1/invoices/:id/status
 */
export async function updateInvoiceStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateInvoiceStatusRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await updateInvoiceStatus(id, data.status, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Regenerate invoice PDF
 * POST /api/v1/invoices/:id/regenerate-pdf
 */
export async function regenerateInvoicePDFController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await regenerateInvoicePDF(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getMessage('invoice.pdf_regenerated', locale),
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Download invoice PDF
 * GET /api/v1/invoices/:id/pdf
 */
export async function downloadInvoicePDFController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const invoice = await getInvoice(id, userId, userRole);

    if (!invoice.pdf_url) {
      res.status(404).json({
        status: 'error',
        message: 'PDF not found for this invoice',
      });
      return;
    }

    // Redirect to PDF URL
    res.redirect(invoice.pdf_url);
  } catch (error) {
    next(error);
  }
}

