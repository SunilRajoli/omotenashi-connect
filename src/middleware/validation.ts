/**
 * Validation Middleware
 * Request validation using Zod schemas
 * Security: Input validation, sanitization, type checking
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/httpErrors';
import { logger } from '../utils/logger';

/**
 * Validate request body
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(
          { path: req.path, errors: details },
          'Request body validation failed'
        );
        
        return next(
          new ValidationError('Invalid request body', { errors: details })
        );
      }
      
      next(error);
    }
  };
}

/**
 * Validate request query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(
          { path: req.path, errors: details },
          'Request query validation failed'
        );
        
        return next(
          new ValidationError('Invalid query parameters', { errors: details })
        );
      }
      
      next(error);
    }
  };
}

/**
 * Validate request parameters
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(
          { path: req.path, errors: details },
          'Request params validation failed'
        );
        
        return next(
          new ValidationError('Invalid request parameters', { errors: details })
        );
      }
      
      next(error);
    }
  };
}

/**
 * Validate all (body, query, params)
 */
export function validateAll(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(
          { path: req.path, errors: details },
          'Request validation failed'
        );
        
        return next(
          new ValidationError('Invalid request', { errors: details })
        );
      }
      
      next(error);
    }
  };
}

/**
 * Sanitize request body
 * Removes potentially dangerous fields and trims strings
 */
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip dangerous keys
      if (key.startsWith('__') || key.startsWith('$')) {
        continue;
      }
      
      // Trim strings
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate UUID parameter
 */
export function validateUUID(paramName: string = 'id') {
  return validateParams(
    z.object({
      [paramName]: z.string().uuid('Invalid UUID format'),
    })
  );
}

/**
 * Validate pagination query
 */
export function validatePagination() {
  return validateQuery(
    z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
  );
}

