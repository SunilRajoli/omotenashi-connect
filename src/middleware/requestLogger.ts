/**
 * Request Logger Middleware
 * Structured logging for all HTTP requests
 * Security: Request tracking, audit logging, error tracking
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/crypto';
import { isHttpError } from '../utils/httpErrors';
import { getLocale } from './i18n';
import { getMessage } from '../utils/messages';

/**
 * Request logger middleware
 * Logs all incoming requests with structured data
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate unique request ID for tracing
  const requestId = req.headers['x-request-id'] as string || generateToken(16);
  req.requestId = requestId;
  
  // Set request ID header
  res.setHeader('X-Request-ID', requestId);
  
  // Capture start time
  const startTime = Date.now();
  
  // Log request
  logger.info(
    {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      businessId: req.business?.id,
    },
    'Incoming request'
  );
  
  // Capture response
  const originalSend = res.send;
  res.send = function (body: unknown) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
        businessId: req.business?.id,
      },
      'Request completed'
    );
    
    return originalSend.call(this, body);
  };
  
  // Log errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const duration = Date.now() - startTime;
      
      logger.warn(
        {
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userId: req.user?.id,
          businessId: req.business?.id,
        },
        'Request failed'
      );
    }
  });
  
  next();
}

/**
 * Error logger middleware
 * Logs errors with full context
 */
export function errorLogger(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';
  
  // Log error with full context
  logger.error(
    {
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      userId: req.user?.id,
      businessId: req.business?.id,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
    'Request error'
  );
  
  // Get locale from request
  const locale = getLocale(req);
  
  // Send error response
  if (isHttpError(error)) {
    // Try to get localized error message
    let errorMessage = error.message;
    
    // Map common error codes to localized messages
    if (error.code) {
      const localizedKey = `auth.${error.code.toLowerCase()}`;
      const localizedMessage = getMessage(localizedKey, locale);
      if (localizedMessage !== localizedKey) {
        errorMessage = localizedMessage;
      }
    }
    
    res.status(error.statusCode).json({
      success: false,
      error: errorMessage,
      code: error.code,
      details: error.details,
      requestId,
    });
  } else {
    // Don't expose internal errors in production
    const message =
      process.env.NODE_ENV === 'production'
        ? getMessage('auth.error.internal', locale)
        : error.message;
    
    res.status(500).json({
      success: false,
      error: message,
      requestId,
    });
  }
  
  next();
}

/**
 * Security headers middleware
 * Adds security headers to responses
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (adjust based on your needs)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  // HSTS (if using HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  
  next();
}

/**
 * Request ID middleware (standalone)
 * Generates and attaches request ID
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string || generateToken(16);
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

