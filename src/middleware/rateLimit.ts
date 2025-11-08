/**
 * Rate Limiting Middleware
 * Redis-based rate limiting for API protection
 * Security: Prevents brute force, DDoS, and abuse
 */

import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { RateLimit } from '../models/rateLimit.model';
import { TooManyRequestsError } from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { hashToken } from '../utils/crypto';
import { Op } from 'sequelize';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
}

/**
 * Generate rate limit key
 */
function generateKey(req: Request, options: RateLimitOptions): string {
  if (options.keyGenerator) {
    return options.keyGenerator(req);
  }
  
  // Default: Use user ID if authenticated, otherwise IP address
  const identifier = req.user?.id || req.ip || 'unknown';
  const path = req.path;
  
  return `rate_limit:${path}:${identifier}`;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimit(options: RateLimitOptions) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const key = generateKey(req, options);
      const now = Date.now();
      const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
      const windowEnd = windowStart + options.windowMs;
      
      // Try Redis first (faster)
      try {
        await redis.connect();
        const redisKey = `rate_limit:${key}:${windowStart}`;
        const count = await redis.incr(redisKey);
        
        if (count === 1) {
          // Set expiration for the window
          await redis.expire(redisKey, Math.ceil(options.windowMs / 1000));
        }
        
        const remaining = Math.max(0, options.maxRequests - count);
        const reset = new Date(windowEnd);
        
        // Attach rate limit info to request
        req.rateLimit = {
          remaining,
          reset,
        };
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor(reset.getTime() / 1000));
        
        if (count > options.maxRequests) {
          logger.warn(
            { key, count, limit: options.maxRequests, path: req.path },
            'Rate limit exceeded'
          );
          
          // Store in database for analytics
          await RateLimit.create({
            key: hashToken(key),
            count,
            window_start: new Date(windowStart),
            expires_at: new Date(windowEnd),
          });
          
          return next(
            new TooManyRequestsError(
              options.message || 'Too many requests, please try again later'
            )
          );
        }
        
        return next();
      } catch (redisError) {
        // Fallback to database if Redis fails
        logger.warn({ error: redisError }, 'Redis rate limit failed, using database fallback');
      }
      
      // Database fallback
      const rateLimitRecord = await RateLimit.findOne({
        where: {
          key: hashToken(key),
          window_start: {
            [Op.gte]: new Date(windowStart),
            [Op.lt]: new Date(windowEnd),
          },
          expires_at: {
            [Op.gt]: new Date(),
          },
        },
      });
      
      if (rateLimitRecord) {
        const newCount = rateLimitRecord.count + 1;
        await rateLimitRecord.update({ count: newCount });
        
        const remaining = Math.max(0, options.maxRequests - newCount);
        const reset = new Date(windowEnd);
        
        req.rateLimit = {
          remaining,
          reset,
        };
        
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor(reset.getTime() / 1000));
        
        if (newCount > options.maxRequests) {
          logger.warn(
            { key, count: newCount, limit: options.maxRequests },
            'Rate limit exceeded (database)'
          );
          return next(
            new TooManyRequestsError(
              options.message || 'Too many requests, please try again later'
            )
          );
        }
      } else {
        // Create new rate limit record
        await RateLimit.create({
          key: hashToken(key),
          count: 1,
          window_start: new Date(windowStart),
          expires_at: new Date(windowEnd),
        });
        
        const remaining = options.maxRequests - 1;
        const reset = new Date(windowEnd);
        
        req.rateLimit = {
          remaining,
          reset,
        };
        
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor(reset.getTime() / 1000));
      }
      
      next();
    } catch (error) {
      logger.error({ error }, 'Rate limit middleware error');
      // Allow request through if rate limiting fails
      next();
    }
  };
}

/**
 * Standard rate limits
 */

// Strict rate limit (100 requests per 15 minutes)
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests. Please try again in 15 minutes.',
});

// Standard rate limit (1000 requests per hour)
export const standardRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  message: 'Too many requests. Please try again in an hour.',
});

// Auth rate limit (5 requests per 15 minutes) - prevents brute force
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const identifier = req.body.email || req.ip || 'unknown';
    return `auth:${identifier}`;
  },
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// Payment rate limit (10 requests per minute) - prevents payment abuse
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyGenerator: (req) => {
    const identifier = req.user?.id || req.ip || 'unknown';
    return `payment:${identifier}`;
  },
  message: 'Too many payment requests. Please try again in a minute.',
});

// Per-user rate limit (1000 requests per hour per user)
export const userRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  keyGenerator: (req) => {
    if (!req.user) {
      return `ip:${req.ip || 'unknown'}`;
    }
    return `user:${req.user.id}`;
  },
  message: 'Too many requests. Please try again in an hour.',
});

