/**
 * Tenant Guard Middleware
 * Business isolation and multi-tenant security
 */

import { Request, Response, NextFunction } from 'express';
import { WhereOptions, Includeable } from 'sequelize';
import { Business } from '../models/business.model';
import { StaffAssignment } from '../models/staffAssignment.model';
import { NotFoundError, ForbiddenError } from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { UserRole } from '../types/enums';

// NOTE: assumes you have Express namespace augmentation for req.user and req.business

/**
 * Tenant guard middleware
 * Verifies user has access to the business in the request
 */
export async function tenantGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    // Extract business ID from various sources
    const businessId =
      (req.params as Record<string, string | undefined>).business_id ??
      (req.params as Record<string, string | undefined>).businessId ??
      (req.body as Record<string, unknown>)['business_id'] ??
      (req.body as Record<string, unknown>)['businessId'] ??
      (req.query as Record<string, unknown>)['business_id'] ??
      (req.query as Record<string, unknown>)['businessId'] ??
      req.user.businessId;

    if (!businessId) {
      // Some routes don't require business context (e.g., admin routes)
      return next();
    }

    // Admins can access any business
    if (req.user.role === UserRole.ADMIN) {
      const business = await Business.findByPk(String(businessId));
      if (!business) {
        return next(new NotFoundError('Business not found'));
      }
      req.business = business;
      return next();
    }

    // Owners can only access their own businesses
    if (req.user.role === UserRole.OWNER) {
      const where: WhereOptions = {
        id: String(businessId),
        owner_id: req.user.id,
        deleted_at: null, // IS NULL
      };
      const business = await Business.findOne({ where });

      if (!business) {
        logger.warn(
          { userId: req.user.id, businessId, role: req.user.role },
          'Access denied: business not found or not owned'
        );
        return next(new ForbiddenError('Access denied to this business'));
      }

      req.business = business;
      return next();
    }

    // Staff can access businesses they're assigned to
    if (req.user.role === UserRole.STAFF) {
      const where: WhereOptions = {
        user_id: req.user.id,
        business_id: String(businessId),
        terminated_at: null,
      };

      // Include business association
      const include: Includeable[] = [
        { association: 'business' },
      ];

      const assignment = await StaffAssignment.findOne({ where, include });

      if (!assignment) {
        logger.warn(
          { userId: req.user.id, businessId, role: req.user.role },
          'Access denied: staff not assigned to business'
        );
        return next(new ForbiddenError('Access denied to this business'));
      }

      // `business` comes via the association include
      const business = (assignment as unknown as { business?: Business }).business;
      if (!business) {
        logger.warn(
          { userId: req.user.id, businessId, role: req.user.role },
          'Access denied: business not found in assignment'
        );
        return next(new ForbiddenError('Access denied to this business'));
      }

      req.business = business;
      return next();
    }

    // Customers (and other roles) can access approved businesses (read-only contexts)
    const where: WhereOptions = {
      id: String(businessId),
      status: 'approved',
      deleted_at: null,
    };

    const business = await Business.findOne({ where });

    if (!business) {
      return next(new NotFoundError('Business not found'));
    }

    req.business = business;
    return next();
  } catch (error) {
    logger.error({ error, path: req.path }, 'Tenant guard error');
    return next(error);
  }
}

/**
 * Require business context
 */
export function requireBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.business) {
    return next(new ForbiddenError('Business context required'));
  }
  next();
}

/**
 * Verify user owns the business
 */
export async function requireBusinessOwner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!req.business) {
      return next(new ForbiddenError('Business context required'));
    }

    // Admins can access any business
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (req.business.owner_id !== req.user.id) {
      logger.warn(
        { userId: req.user.id, businessId: req.business.id },
        'Access denied: user does not own business'
      );
      return next(new ForbiddenError('You do not own this business'));
    }

    return next();
  } catch (error) {
    logger.error({ error }, 'Business owner check failed');
    return next(error);
  }
}

/**
 * Verify user is staff of the business (or owner/admin)
 */
export async function requireBusinessStaff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!req.business) {
      return next(new ForbiddenError('Business context required'));
    }

    // Owners of this business or admins are allowed
    if (
      req.user.role === UserRole.ADMIN ||
      (req.user.role === UserRole.OWNER && req.business.owner_id === req.user.id)
    ) {
      return next();
    }

    if (req.user.role === UserRole.STAFF) {
      const where: WhereOptions = {
        user_id: req.user.id,
        business_id: req.business.id,
        terminated_at: null,
      };

      const assignment = await StaffAssignment.findOne({ where });
      if (!assignment) {
        logger.warn(
          { userId: req.user.id, businessId: req.business.id },
          'Access denied: user is not staff of business'
        );
        return next(new ForbiddenError('You are not staff of this business'));
      }

      return next();
    }

    return next(new ForbiddenError('Insufficient permissions'));
  } catch (error) {
    logger.error({ error }, 'Business staff check failed');
    return next(error);
  }
}

/**
 * Verify business is approved
 */
export function requireApprovedBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.business) {
    return next(new ForbiddenError('Business context required'));
  }

  if (req.business.status !== 'approved') {
    return next(new ForbiddenError('Business is not approved'));
  }

  return next();
}
