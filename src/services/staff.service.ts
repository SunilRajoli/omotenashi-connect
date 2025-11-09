/**
 * Staff Service
 * Handles staff management, scheduling, and assignment to bookings
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { StaffAssignment, StaffRole } from '../models/staffAssignment.model';
import { StaffWorkingHour } from '../models/staffWorkingHour.model';
import { StaffException } from '../models/staffException.model';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import { Resource } from '../models/resource.model';
import { Booking } from '../models/booking.model';
import { Service } from '../models/service.model';
import { Customer } from '../models/customer.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import {
  CreateStaffAssignmentRequest,
  UpdateStaffAssignmentRequest,
  StaffAssignmentQueryParams,
  CreateStaffWorkingHoursRequest,
  CreateStaffExceptionRequest,
  UpdateStaffExceptionRequest,
  StaffExceptionQueryParams,
  AssignStaffToBookingRequest,
} from '../validators/staff.validator';

/**
 * Create staff assignment
 */
export async function createStaffAssignment(
  data: CreateStaffAssignmentRequest,
  ownerId: string
): Promise<StaffAssignment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists and user is owner
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    if (business.owner_id !== ownerId) {
      throw new ForbiddenError('You can only assign staff to your own businesses');
    }

    // Verify user exists
    const user = await User.findByPk(data.user_id, { transaction });
    if (!user || user.deleted_at) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already assigned to this business
    const existingAssignment = await StaffAssignment.findOne({
      where: {
        user_id: data.user_id,
        business_id: data.business_id,
        terminated_at: { [Op.is]: null },
      } as WhereOptions,
      transaction,
    });

    if (existingAssignment) {
      throw new ConflictError('User is already assigned to this business');
    }

    // Create staff assignment
    const assignment = await StaffAssignment.create(
      {
        user_id: data.user_id,
        business_id: data.business_id,
        role: data.role,
        permissions_json: data.permissions_json || {},
        hired_at: new Date(),
      },
      { transaction }
    );

    logger.info({ assignmentId: assignment.id, businessId: data.business_id, userId: data.user_id }, 'Staff assignment created');

    return assignment.reload({
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'display_name', 'given_name', 'family_name'] },
        { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      ],
      transaction,
    });
  });
}

/**
 * List staff assignments
 */
export async function listStaffAssignments(
  query: StaffAssignmentQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ assignments: StaffAssignment[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.user_id) {
    where.user_id = query.user_id;
  }
  if (query.role) {
    where.role = query.role;
  }

  // Filter active assignments
  if (query.active_only !== false) {
    where.terminated_at = { [Op.is]: null };
  }

  // Access control: owners can only see staff for their businesses
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
      return { assignments: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // If business_id is specified, verify it belongs to the user
    if (query.business_id && !businessIds.includes(query.business_id)) {
      throw new ForbiddenError('You can only view staff for your own businesses');
    }

    where.business_id = query.business_id ? query.business_id : { [Op.in]: businessIds };
  }

  // Staff can only see their own assignment
  if (userRole === 'staff' && userId) {
    where.user_id = userId;
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await StaffAssignment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'display_name', 'given_name', 'family_name'] },
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
    ],
    order: [['hired_at', 'DESC']],
    limit,
    offset,
  });

  return {
    assignments: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get staff assignment by ID
 */
export async function getStaffAssignmentById(
  assignmentId: string,
  userId?: string,
  userRole?: string
): Promise<StaffAssignment> {
  const assignment = await StaffAssignment.findByPk(assignmentId, {
    include: [
      { model: User, as: 'user' },
      { model: Business, as: 'business' },
    ],
  });

  if (!assignment) {
    throw new NotFoundError('Staff assignment not found');
  }

  // Access control
  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(assignment.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view staff assignments for your own businesses');
    }
  }

  if (userRole === 'staff' && userId) {
    if (assignment.user_id !== userId) {
      throw new ForbiddenError('You can only view your own staff assignment');
    }
  }

  return assignment;
}

/**
 * Update staff assignment
 */
export async function updateStaffAssignment(
  assignmentId: string,
  data: UpdateStaffAssignmentRequest,
  userId: string,
  userRole: string
): Promise<StaffAssignment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const assignment = await StaffAssignment.findByPk(assignmentId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!assignment) {
      throw new NotFoundError('Staff assignment not found');
    }

    // Access control: only owners can update staff assignments
    const business = assignment.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only update staff assignments for your own businesses');
      }
    }

    // Update assignment
    await assignment.update(
      {
        role: data.role ?? assignment.role,
        permissions_json: data.permissions_json ?? assignment.permissions_json,
      },
      { transaction }
    );

    logger.info({ assignmentId, userId }, 'Staff assignment updated');

    return assignment.reload({
      include: [
        { model: User, as: 'user' },
        { model: Business, as: 'business' },
      ],
      transaction,
    });
  });
}

/**
 * Terminate staff assignment
 */
export async function terminateStaffAssignment(
  assignmentId: string,
  userId: string,
  userRole: string
): Promise<StaffAssignment> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const assignment = await StaffAssignment.findByPk(assignmentId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!assignment) {
      throw new NotFoundError('Staff assignment not found');
    }

    if (assignment.terminated_at) {
      throw new BadRequestError('Staff assignment is already terminated');
    }

    // Access control: only owners can terminate staff assignments
    const business = assignment.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only terminate staff assignments for your own businesses');
      }
    }

    // Terminate assignment
    await assignment.update(
      {
        terminated_at: new Date(),
      },
      { transaction }
    );

    logger.info({ assignmentId, userId }, 'Staff assignment terminated');

    return assignment.reload({
      include: [
        { model: User, as: 'user' },
        { model: Business, as: 'business' },
      ],
      transaction,
    });
  });
}

/**
 * Create or update staff working hours
 */
export async function createStaffWorkingHours(
  data: CreateStaffWorkingHoursRequest,
  userId: string,
  userRole: string
): Promise<StaffWorkingHour[]> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify resource exists and is a staff resource
    const resource = await Resource.findByPk(data.resource_id, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!resource || resource.deleted_at) {
      throw new NotFoundError('Resource not found');
    }

    if (resource.type !== 'staff') {
      throw new BadRequestError('Resource must be of type staff');
    }

    // Access control: only owners can manage working hours
    const business = resource.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only manage working hours for your own businesses');
      }
    }

    // Delete existing working hours for this resource
    await StaffWorkingHour.destroy({
      where: { resource_id: data.resource_id },
      transaction,
    });

    // Create new working hours
    const workingHours = await Promise.all(
      data.working_hours.map((wh) =>
        StaffWorkingHour.create(
          {
            resource_id: data.resource_id,
            day_of_week: wh.day_of_week,
            start_time: wh.start_time,
            end_time: wh.end_time,
          },
          { transaction }
        )
      )
    );

    logger.info({ resourceId: data.resource_id, count: workingHours.length }, 'Staff working hours created');

    return workingHours;
  });
}

/**
 * Get staff working hours
 */
export async function getStaffWorkingHours(
  resourceId: string,
  userId?: string,
  userRole?: string
): Promise<StaffWorkingHour[]> {
  // Verify resource exists
  const resource = await Resource.findByPk(resourceId, {
    include: [{ model: Business, as: 'business' }],
  });

  if (!resource || resource.deleted_at) {
    throw new NotFoundError('Resource not found');
  }

  // Access control
  const business = resource.get('business') as Business | undefined;
  if (business && userRole === 'owner' && userId) {
    if (business.owner_id !== userId) {
      throw new ForbiddenError('You can only view working hours for your own businesses');
    }
  }

  const workingHours = await StaffWorkingHour.findAll({
    where: { resource_id: resourceId },
    include: [{ model: Resource, as: 'resource' }],
    order: [['day_of_week', 'ASC']],
  });

  return workingHours;
}

/**
 * Create staff exception
 */
export async function createStaffException(
  data: CreateStaffExceptionRequest,
  userId: string,
  userRole: string
): Promise<StaffException> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify resource exists and is a staff resource
    const resource = await Resource.findByPk(data.resource_id, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!resource || resource.deleted_at) {
      throw new NotFoundError('Resource not found');
    }

    if (resource.type !== 'staff') {
      throw new BadRequestError('Resource must be of type staff');
    }

    // Access control: only owners can create exceptions
    const business = resource.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only create exceptions for your own businesses');
      }
    }

    // Check if exception already exists for this date
    const existingException = await StaffException.findOne({
      where: {
        resource_id: data.resource_id,
        date: data.date,
      },
      transaction,
    });

    if (existingException) {
      throw new ConflictError('Exception already exists for this date');
    }

    // Create exception
    const exception = await StaffException.create(
      {
        resource_id: data.resource_id,
        date: data.date as unknown as Date,
        is_working: data.is_working,
        note: data.note,
      },
      { transaction }
    );

    logger.info({ exceptionId: exception.id, resourceId: data.resource_id, date: data.date }, 'Staff exception created');

    return exception.reload({
      include: [{ model: Resource, as: 'resource' }],
      transaction,
    });
  });
}

/**
 * List staff exceptions
 */
export async function listStaffExceptions(
  query: StaffExceptionQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ exceptions: StaffException[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.resource_id) {
    where.resource_id = query.resource_id;
  }

  // Date range filter
  if (query.start_date || query.end_date) {
    const dateFilter: { [Op.gte]?: string; [Op.lte]?: string } = {};
    if (query.start_date) {
      dateFilter[Op.gte] = query.start_date;
    }
    if (query.end_date) {
      dateFilter[Op.lte] = query.end_date;
    }
    where.date = dateFilter;
  }

  // Access control: owners can only see exceptions for their businesses
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
      return { exceptions: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    // Get resources for these businesses
    const resources = await Resource.findAll({
      where: {
        business_id: { [Op.in]: businessIds },
        type: 'staff',
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const resourceIds = resources.map((r) => r.id);
    if (resourceIds.length === 0) {
      return { exceptions: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    if (query.resource_id && !resourceIds.includes(query.resource_id)) {
      throw new ForbiddenError('You can only view exceptions for your own businesses');
    }

    where.resource_id = query.resource_id ? query.resource_id : { [Op.in]: resourceIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await StaffException.findAndCountAll({
    where,
    include: [{ model: Resource, as: 'resource' }],
    order: [['date', 'DESC']],
    limit,
    offset,
  });

  return {
    exceptions: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Update staff exception
 */
export async function updateStaffException(
  exceptionId: string,
  data: UpdateStaffExceptionRequest,
  userId: string,
  userRole: string
): Promise<StaffException> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const exception = await StaffException.findByPk(exceptionId, {
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [{ model: Business, as: 'business' }],
        },
      ],
      transaction,
    });

    if (!exception) {
      throw new NotFoundError('Staff exception not found');
    }

    // Access control: only owners can update exceptions
    const resource = exception.get('resource') as Resource | undefined;
    if (resource) {
      const business = resource.get('business') as Business | undefined;
      if (business) {
        if (business.owner_id !== userId && userRole !== 'admin') {
          throw new ForbiddenError('You can only update exceptions for your own businesses');
        }
      }
    }

    // Update exception
    await exception.update(
      {
        is_working: data.is_working ?? exception.is_working,
        note: data.note ?? exception.note,
      },
      { transaction }
    );

    logger.info({ exceptionId, userId }, 'Staff exception updated');

    return exception.reload({
      include: [{ model: Resource, as: 'resource' }],
      transaction,
    });
  });
}

/**
 * Delete staff exception
 */
export async function deleteStaffException(
  exceptionId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const exception = await StaffException.findByPk(exceptionId, {
      include: [
        {
          model: Resource,
          as: 'resource',
          include: [{ model: Business, as: 'business' }],
        },
      ],
      transaction,
    });

    if (!exception) {
      throw new NotFoundError('Staff exception not found');
    }

    // Access control: only owners can delete exceptions
    const resource = exception.get('resource') as Resource | undefined;
    if (resource) {
      const business = resource.get('business') as Business | undefined;
      if (business) {
        if (business.owner_id !== userId && userRole !== 'admin') {
          throw new ForbiddenError('You can only delete exceptions for your own businesses');
        }
      }
    }

    await exception.destroy({ transaction });

    logger.info({ exceptionId, userId }, 'Staff exception deleted');
  });
}

/**
 * Assign staff to booking
 */
export async function assignStaffToBooking(
  data: AssignStaffToBookingRequest,
  userId: string,
  userRole: string
): Promise<Booking> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify booking exists
    const booking = await Booking.findByPk(data.booking_id, {
      include: [
        { model: Business, as: 'business' },
        { model: Resource, as: 'resource' },
      ],
      transaction,
    });

    if (!booking || booking.deleted_at) {
      throw new NotFoundError('Booking not found');
    }

    // Access control: only owners and staff can assign staff to bookings
    const business = booking.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin' && userRole !== 'staff') {
        throw new ForbiddenError('You can only assign staff to bookings for your own businesses');
      }
    }

    // Verify resource exists and is a staff resource
    const resource = await Resource.findByPk(data.resource_id, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!resource || resource.deleted_at) {
      throw new NotFoundError('Resource not found');
    }

    if (resource.type !== 'staff') {
      throw new BadRequestError('Resource must be of type staff');
    }

    // Verify resource belongs to the same business
    if (resource.business_id !== booking.business_id) {
      throw new BadRequestError('Resource must belong to the same business as the booking');
    }

    // Update booking with resource
    await booking.update(
      {
        resource_id: data.resource_id,
      },
      { transaction }
    );

    logger.info({ bookingId: data.booking_id, resourceId: data.resource_id, userId }, 'Staff assigned to booking');

    return booking.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Resource, as: 'resource' },
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' },
      ],
      transaction,
    });
  });
}

