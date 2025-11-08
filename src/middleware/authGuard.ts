/**
 * Authentication Guard Middleware
 * JWT token verification and user authentication
 * Security: Token validation, refresh token handling, role-based access
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { UserRole } from '../types/enums';
import { UnauthorizedError, ForbiddenError } from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { RefreshToken } from '../models/refreshToken.model';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  businessId?: string;
  type: 'access' | 'refresh';
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw new UnauthorizedError('Refresh token verification failed');
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }
    
    // Verify token
    const payload = verifyAccessToken(token);
    
    // Load user from database
    const user = await User.findByPk(payload.userId, {
      attributes: ['id', 'email', 'role', 'is_active', 'deleted_at'],
    });
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    if (user.deleted_at) {
      throw new UnauthorizedError('User account deleted');
    }
    
    if (!user.is_active) {
      throw new ForbiddenError('User account is inactive');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: payload.businessId,
    };
    
    next();
  } catch (error) {
    logger.warn({ error, path: req.path }, 'Authentication failed');
    
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      const user = await User.findByPk(payload.userId, {
        attributes: ['id', 'email', 'role', 'is_active', 'deleted_at'],
      });
      
      if (user && !user.deleted_at && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          businessId: payload.businessId,
        };
      }
    }
    
    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Role-based access control middleware factory
 * Restricts access to specific roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        { userId: req.user.id, role: req.user.role, allowedRoles },
        'Access denied: insufficient role'
      );
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Require owner or admin
 */
export const requireOwnerOrAdmin = requireRole(UserRole.OWNER, UserRole.ADMIN);

/**
 * Require staff or above
 */
export const requireStaffOrAbove = requireRole(
  UserRole.ADMIN,
  UserRole.OWNER,
  UserRole.STAFF
);

/**
 * Verify refresh token and check database
 */
export async function verifyRefreshTokenInDB(
  token: string
): Promise<{ userId: string; tokenId: string }> {
  const payload = verifyRefreshToken(token);
  
  // Check if refresh token exists in database and is not expired
  const { Op } = await import('sequelize');
  const refreshToken = await RefreshToken.findOne({
    where: {
      user_id: payload.userId,
      expires_at: {
        [Op.gt]: new Date(),
      },
    },
    order: [['created_at', 'DESC']],
  });
  
  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token not found or expired');
  }
  
  // Verify token hash matches
  const { hashToken } = await import('../utils/crypto');
  const tokenHash = hashToken(token);
  
  if (refreshToken.token_hash !== tokenHash) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  return {
    userId: payload.userId,
    tokenId: refreshToken.id,
  };
}

