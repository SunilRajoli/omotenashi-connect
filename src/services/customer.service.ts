/**
 * Customer Service
 * Handles customer management, notes, and history
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Customer } from '../models/customer.model';
import { CustomerNote } from '../models/customerNote.model';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { Review } from '../models/review.model';
import { Waitlist } from '../models/waitlist.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
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
 */
export async function createCustomer(
  data: CreateCustomerRequest,
  userId?: string
): Promise<Customer> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control: only owners and admins can create customers
    if (userId) {
      const user = await User.findByPk(userId, { transaction });
      if (user && user.role !== 'admin' && business.owner_id !== userId) {
        throw new ForbiddenError('You can only create customers for your own businesses');
      }
    }

    // Validate that at least name or email is provided
    if (!data.name && !data.email && !data.user_id) {
      throw new BadRequestError('At least name, email, or user_id must be provided');
    }

    // Check if customer already exists (by email or user_id)
    if (data.email || data.user_id) {
      const existingWhere: WhereOptions = {
        business_id: data.business_id,
        deleted_at: { [Op.is]: null },
      };

      if (data.email) {
        existingWhere.email = data.email;
      }
      if (data.user_id) {
        existingWhere.user_id = data.user_id;
      }

      const existingCustomer = await Customer.findOne({
        where: existingWhere,
        transaction,
      });

      if (existingCustomer) {
        throw new ConflictError('Customer already exists for this business');
      }
    }

    // Create customer
    const customer = await Customer.create(
      {
        business_id: data.business_id,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferences_json: data.preferences_json || {},
        no_show_count: 0,
      },
      { transaction }
    );

    logger.info({ customerId: customer.id, businessId: data.business_id }, 'Customer created');

    return customer.reload({
      include: [
        { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'display_name'] },
      ],
      transaction,
    });
  });
}

/**
 * List customers
 */
export async function listCustomers(
  query: CustomerQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.user_id) {
    where.user_id = query.user_id;
  }
  if (query.email) {
    where.email = query.email;
  }
  if (query.phone) {
    where.phone = query.phone;
  }

  // Access control: owners can only see customers for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { customers: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // If business_id is specified, verify it belongs to the user
    if (query.business_id && !businessIds.includes(query.business_id)) {
      throw new ForbiddenError('You can only view customers for your own businesses');
    }

    where.business_id = query.business_id ? query.business_id : { [Op.in]: businessIds };
  }

  // Customers can only see their own customer records
  if (userRole === 'customer' && userId) {
    where.user_id = userId;
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Customer.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      { model: User, as: 'user', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    customers: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  customerId: string,
  userId?: string,
  userRole?: string
): Promise<Customer> {
  const customer = await Customer.findByPk(customerId, {
    include: [
      { model: Business, as: 'business' },
      { model: User, as: 'user' },
    ],
  });

  if (!customer || customer.deleted_at) {
    throw new NotFoundError('Customer not found');
  }

  // Access control
  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(customer.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view customers for your own businesses');
    }
  }

  if (userRole === 'customer' && userId) {
    if (customer.user_id !== userId) {
      throw new ForbiddenError('You can only view your own customer record');
    }
  }

  return customer;
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerRequest,
  userId: string,
  userRole: string
): Promise<Customer> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }

    // Access control: owners can update customers for their businesses, customers can update their own
    const business = customer.get('business') as Business | undefined;
    if (business) {
      if (userRole === 'customer') {
        if (customer.user_id !== userId) {
          throw new ForbiddenError('You can only update your own customer record');
        }
      } else if (userRole !== 'admin' && business.owner_id !== userId) {
        throw new ForbiddenError('You can only update customers for your own businesses');
      }
    }

    // Check for email conflicts if email is being updated
    if (data.email && data.email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        where: {
          business_id: customer.business_id,
          email: data.email,
          deleted_at: { [Op.is]: null },
          id: { [Op.ne]: customerId },
        } as WhereOptions,
        transaction,
      });

      if (existingCustomer) {
        throw new ConflictError('Email already exists for another customer in this business');
      }
    }

    // Update customer
    await customer.update(
      {
        name: data.name ?? customer.name,
        email: data.email ?? customer.email,
        phone: data.phone ?? customer.phone,
        preferences_json: data.preferences_json ?? customer.preferences_json,
      },
      { transaction }
    );

    logger.info({ customerId, userId }, 'Customer updated');

    return customer.reload({
      include: [
        { model: Business, as: 'business' },
        { model: User, as: 'user' },
      ],
      transaction,
    });
  });
}

/**
 * Delete customer (soft delete)
 */
export async function deleteCustomer(
  customerId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }

    // Access control: only owners and admins can delete customers
    const business = customer.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only delete customers for your own businesses');
      }
    }

    // Soft delete
    await customer.update(
      {
        deleted_at: new Date(),
      },
      { transaction }
    );

    logger.info({ customerId, userId }, 'Customer deleted');
  });
}

/**
 * Get customer history
 */
export async function getCustomerHistory(
  customerId: string,
  userId?: string,
  userRole?: string
): Promise<{
  bookings: Booking[];
  reviews: Review[];
  waitlist: Waitlist[];
  notes: CustomerNote[];
}> {
  // Verify customer exists
  const customer = await Customer.findByPk(customerId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!customer || customer.deleted_at) {
    throw new NotFoundError('Customer not found');
  }

  // Access control
  if (userRole === 'owner' && userId) {
    const business = customer.get('business') as Business | undefined;
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view customer history for your own businesses');
    }
  }

  if (userRole === 'customer' && userId) {
    if (customer.user_id !== userId) {
      throw new ForbiddenError('You can only view your own customer history');
    }
  }

  // Get customer history
  const [bookings, reviews, waitlist, notes] = await Promise.all([
    Booking.findAll({
      where: {
        customer_id: customerId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      order: [['start_at', 'DESC']],
      limit: 50,
    }),
    Review.findAll({
      where: {
        customer_id: customerId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
    Waitlist.findAll({
      where: {
        customer_id: customerId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
    CustomerNote.findAll({
      where: {
        customer_id: customerId,
      },
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
  ]);

  return {
    bookings,
    reviews,
    waitlist,
    notes,
  };
}

/**
 * Create customer note
 */
export async function createCustomerNote(
  data: CreateCustomerNoteRequest,
  userId: string,
  userRole: string
): Promise<CustomerNote> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify customer exists
    const customer = await Customer.findByPk(data.customer_id, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!customer || customer.deleted_at) {
      throw new NotFoundError('Customer not found');
    }

    // Access control: only owners, staff, and admins can create notes
    const business = customer.get('business') as Business | undefined;
    if (business) {
      if (userRole === 'customer') {
        throw new ForbiddenError('Customers cannot create notes');
      }
      if (userRole !== 'admin' && business.owner_id !== userId) {
        // Check if user is staff
        const user = await User.findByPk(userId, { transaction });
        if (!user || user.role !== 'staff') {
          throw new ForbiddenError('You can only create notes for customers in your businesses');
        }
      }
    }

    // Create note
    const note = await CustomerNote.create(
      {
        customer_id: data.customer_id,
        note_type: data.note_type,
        note: data.note,
        created_by: userId,
      },
      { transaction }
    );

    logger.info({ noteId: note.id, customerId: data.customer_id, userId }, 'Customer note created');

    return note.reload({
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'creator', attributes: ['id', 'email', 'display_name'] },
      ],
      transaction,
    });
  });
}

/**
 * List customer notes
 */
export async function listCustomerNotes(
  query: CustomerNoteQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ notes: CustomerNote[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }
  if (query.note_type) {
    where.note_type = query.note_type;
  }

  // Access control: owners can only see notes for their business customers
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { notes: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // Get customers for these businesses
    const customers = await Customer.findAll({
      where: {
        business_id: { [Op.in]: businessIds },
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const customerIds = customers.map((c) => c.id);
    if (customerIds.length === 0) {
      return { notes: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    if (query.customer_id && !customerIds.includes(query.customer_id)) {
      throw new ForbiddenError('You can only view notes for customers in your businesses');
    }

    where.customer_id = query.customer_id ? query.customer_id : { [Op.in]: customerIds };
  }

  // Customers can only see their own notes
  if (userRole === 'customer' && userId) {
    const customers = await Customer.findAll({
      where: {
        user_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const customerIds = customers.map((c) => c.id);
    if (customerIds.length === 0) {
      return { notes: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    if (query.customer_id && !customerIds.includes(query.customer_id)) {
      throw new ForbiddenError('You can only view your own customer notes');
    }

    where.customer_id = query.customer_id ? query.customer_id : { [Op.in]: customerIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await CustomerNote.findAndCountAll({
    where,
    include: [
      { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'creator', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    notes: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get customer note by ID
 */
export async function getCustomerNoteById(
  noteId: string,
  userId?: string,
  userRole?: string
): Promise<CustomerNote> {
  const note = await CustomerNote.findByPk(noteId, {
    include: [
      { model: Customer, as: 'customer', include: [{ model: Business, as: 'business' }] },
      { model: User, as: 'creator', attributes: ['id', 'email', 'display_name'] },
    ],
  });

  if (!note) {
    throw new NotFoundError('Customer note not found');
  }

  // Access control
  const customer = note.get('customer') as Customer | undefined;
  if (customer) {
    const business = customer.get('business') as Business | undefined;
    if (business) {
      if (userRole === 'owner' && userId) {
        if (business.owner_id !== userId) {
          throw new ForbiddenError('You can only view notes for customers in your businesses');
        }
      }
      if (userRole === 'customer' && userId) {
        if (customer.user_id !== userId) {
          throw new ForbiddenError('You can only view your own customer notes');
        }
      }
    }
  }

  return note;
}

/**
 * Update customer note
 */
export async function updateCustomerNote(
  noteId: string,
  data: UpdateCustomerNoteRequest,
  userId: string,
  userRole: string
): Promise<CustomerNote> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const note = await CustomerNote.findByPk(noteId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: Business, as: 'business' }],
        },
      ],
      transaction,
    });

    if (!note) {
      throw new NotFoundError('Customer note not found');
    }

    // Access control: only owners, staff, and admins can update notes
    const customer = note.get('customer') as Customer | undefined;
    if (customer) {
      const business = customer.get('business') as Business | undefined;
      if (business) {
        if (userRole === 'customer') {
          throw new ForbiddenError('Customers cannot update notes');
        }
        if (userRole !== 'admin' && business.owner_id !== userId) {
          // Check if user is staff
          const user = await User.findByPk(userId, { transaction });
          if (!user || user.role !== 'staff') {
            throw new ForbiddenError('You can only update notes for customers in your businesses');
          }
        }
      }
    }

    // Update note
    await note.update(
      {
        note: data.note,
      },
      { transaction }
    );

    logger.info({ noteId, userId }, 'Customer note updated');

    return note.reload({
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'creator' },
      ],
      transaction,
    });
  });
}

/**
 * Delete customer note
 */
export async function deleteCustomerNote(
  noteId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const note = await CustomerNote.findByPk(noteId, {
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: Business, as: 'business' }],
        },
      ],
      transaction,
    });

    if (!note) {
      throw new NotFoundError('Customer note not found');
    }

    // Access control: only owners, staff, and admins can delete notes
    const customer = note.get('customer') as Customer | undefined;
    if (customer) {
      const business = customer.get('business') as Business | undefined;
      if (business) {
        if (userRole === 'customer') {
          throw new ForbiddenError('Customers cannot delete notes');
        }
        if (userRole !== 'admin' && business.owner_id !== userId) {
          // Check if user is staff
          const user = await User.findByPk(userId, { transaction });
          if (!user || user.role !== 'staff') {
            throw new ForbiddenError('You can only delete notes for customers in your businesses');
          }
        }
      }
    }

    await note.destroy({ transaction });

    logger.info({ noteId, userId }, 'Customer note deleted');
  });
}

