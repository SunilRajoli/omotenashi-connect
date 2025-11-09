/**
 * Customer Routes
 * Customer management and notes endpoints
 */

import { Router } from 'express';
import {
  createCustomerController,
  listCustomersController,
  getCustomerController,
  updateCustomerController,
  deleteCustomerController,
  getCustomerHistoryController,
  createCustomerNoteController,
  listCustomerNotesController,
  getCustomerNoteController,
  updateCustomerNoteController,
  deleteCustomerNoteController,
} from '../controllers/customer.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  createCustomerNoteSchema,
  updateCustomerNoteSchema,
  customerNoteQuerySchema,
} from '../validators/customer.validator';
import { standardRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * Customer Routes
 */

/**
 * @route   POST /api/v1/customers
 * @desc    Create customer
 * @access  Private (Owner/Admin)
 */
router.post(
  '/customers',
  authGuard,
  standardRateLimit,
  validateBody(createCustomerSchema),
  createCustomerController
);

/**
 * @route   GET /api/v1/customers
 * @desc    List customers
 * @access  Private (Owner/Admin/Customer)
 */
router.get(
  '/customers',
  authGuard,
  standardRateLimit,
  validateQuery(customerQuerySchema),
  listCustomersController
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private (Owner/Admin/Customer)
 */
router.get(
  '/customers/:id',
  authGuard,
  standardRateLimit,
  getCustomerController
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private (Owner/Admin/Customer)
 */
router.put(
  '/customers/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateCustomerSchema),
  updateCustomerController
);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private (Owner/Admin only)
 */
router.delete(
  '/customers/:id',
  authGuard,
  standardRateLimit,
  deleteCustomerController
);

/**
 * @route   GET /api/v1/customers/:id/history
 * @desc    Get customer history
 * @access  Private (Owner/Admin/Customer)
 */
router.get(
  '/customers/:id/history',
  authGuard,
  standardRateLimit,
  getCustomerHistoryController
);

/**
 * Customer Notes Routes
 */

/**
 * @route   POST /api/v1/customers/notes
 * @desc    Create customer note
 * @access  Private (Owner/Admin/Staff)
 */
router.post(
  '/customers/notes',
  authGuard,
  standardRateLimit,
  validateBody(createCustomerNoteSchema),
  createCustomerNoteController
);

/**
 * @route   GET /api/v1/customers/notes
 * @desc    List customer notes
 * @access  Private (Owner/Admin/Staff/Customer)
 */
router.get(
  '/customers/notes',
  authGuard,
  standardRateLimit,
  validateQuery(customerNoteQuerySchema),
  listCustomerNotesController
);

/**
 * @route   GET /api/v1/customers/notes/:id
 * @desc    Get customer note by ID
 * @access  Private (Owner/Admin/Staff/Customer)
 */
router.get(
  '/customers/notes/:id',
  authGuard,
  standardRateLimit,
  getCustomerNoteController
);

/**
 * @route   PUT /api/v1/customers/notes/:id
 * @desc    Update customer note
 * @access  Private (Owner/Admin/Staff)
 */
router.put(
  '/customers/notes/:id',
  authGuard,
  standardRateLimit,
  validateBody(updateCustomerNoteSchema),
  updateCustomerNoteController
);

/**
 * @route   DELETE /api/v1/customers/notes/:id
 * @desc    Delete customer note
 * @access  Private (Owner/Admin/Staff)
 */
router.delete(
  '/customers/notes/:id',
  authGuard,
  standardRateLimit,
  deleteCustomerNoteController
);

export default router;

