/**
 * Customer Controller
 * Handles customer-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
  createCustomerNote,
  listCustomerNotes,
  getCustomerNoteById,
  updateCustomerNote,
  deleteCustomerNote,
} from '../services/customer.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  CreateCustomerNoteRequest,
  UpdateCustomerNoteRequest,
  CustomerNoteQueryParams,
} from '../validators/customer.validator';

/**
 * Create customer
 * POST /api/v1/customers
 */
export async function createCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateCustomerRequest = req.body;
    const userId = req.user?.id;

    const customer = await createCustomer(data, userId);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List customers
 * GET /api/v1/customers
 */
export async function listCustomersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as CustomerQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { customers, total, page, limit } = await listCustomers(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { customers, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get customer by ID
 * GET /api/v1/customers/:id
 */
export async function getCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const customer = await getCustomerById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update customer
 * PUT /api/v1/customers/:id
 */
export async function updateCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateCustomerRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const customer = await updateCustomer(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete customer
 * DELETE /api/v1/customers/:id
 */
export async function deleteCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteCustomer(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get customer history
 * GET /api/v1/customers/:id/history
 */
export async function getCustomerHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const history = await getCustomerHistory(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { history },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create customer note
 * POST /api/v1/customers/notes
 */
export async function createCustomerNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const data: CreateCustomerNoteRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const note = await createCustomerNote(data, userId, userRole);

    res.status(201).json({
      status: 'success',
      message: getSuccessMessage('created', locale),
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List customer notes
 * GET /api/v1/customers/notes
 */
export async function listCustomerNotesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const query = req.query as unknown as CustomerNoteQueryParams;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { notes, total, page, limit } = await listCustomerNotes(query, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('list', locale),
      data: { notes, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get customer note by ID
 * GET /api/v1/customers/notes/:id
 */
export async function getCustomerNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const note = await getCustomerNoteById(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('get', locale),
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update customer note
 * PUT /api/v1/customers/notes/:id
 */
export async function updateCustomerNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateCustomerNoteRequest = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const note = await updateCustomerNote(id, data, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete customer note
 * DELETE /api/v1/customers/notes/:id
 */
export async function deleteCustomerNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    await deleteCustomerNote(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('deleted', locale),
    });
  } catch (error) {
    next(error);
  }
}

