/**
 * Idempotency Middleware
 * Ensures payment and critical operations are idempotent
 * Security: Prevents duplicate payments and race conditions
 */

import { Request, Response, NextFunction } from 'express';
import { IdempotencyKey } from '../models/idempotencyKey.model';
import { ConflictError, BadRequestError } from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { hashIdempotencyKey, isIdempotencyKeyExpired } from '../utils/idempotency';

/**
 * Idempotency middleware
 * Checks for idempotency key in request and ensures operation is not duplicated
 */
export async function idempotencyGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract idempotency key from header
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      // Idempotency key is optional for non-critical operations
      return next();
    }
    
    // Validate key format
    if (!isValidIdempotencyKey(idempotencyKey)) {
      return next(new BadRequestError('Invalid idempotency key format'));
    }
    
    // Check if key is expired
    if (isIdempotencyKeyExpired(idempotencyKey)) {
      return next(new BadRequestError('Idempotency key expired'));
    }
    
    // Generate scope from request
    const scope = generateScope(req);
    const requestHash = hashIdempotencyKey(
      JSON.stringify({
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
      })
    );
    
    // Check for existing idempotency key
    const existingKey = await IdempotencyKey.findOne({
      where: {
        scope,
        request_hash: requestHash,
      },
    });
    
    if (existingKey) {
      // If key exists and operation is complete, return cached response
      if (existingKey.status === 'completed' && existingKey.response_json) {
        logger.info(
          { idempotencyKey, scope },
          'Idempotent request: returning cached response'
        );
        
        // Attach idempotency info to request
        req.idempotencyKey = idempotencyKey;
        
        // Return cached response
        res.status(200).json({
          success: true,
          data: existingKey.response_json,
          idempotent: true,
        });
        return;
      }
      
      // If key exists but operation is in progress, return conflict
      if (existingKey.status === 'processing') {
        logger.warn(
          { idempotencyKey, scope },
          'Idempotent request: operation already in progress'
        );
        return next(
          new ConflictError(
            'Request with this idempotency key is already being processed'
          )
        );
      }
      
      // If key exists but failed, allow retry
      if (existingKey.status === 'failed') {
        logger.info(
          { idempotencyKey, scope },
          'Idempotent request: previous attempt failed, allowing retry'
        );
        // Update status to processing
        await existingKey.update({ status: 'processing' });
        req.idempotencyKey = idempotencyKey;
        return next();
      }
    }
    
    // Create new idempotency key record
    const keyRecord = await IdempotencyKey.create({
      scope,
      request_hash: requestHash,
      status: 'processing',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    
    // Attach idempotency key to request
    req.idempotencyKey = idempotencyKey;
    
    // Store key record ID for later update
    (req as Request & { idempotencyKeyRecord?: IdempotencyKey }).idempotencyKeyRecord = keyRecord;
    
    next();
  } catch (error) {
    logger.error({ error }, 'Idempotency middleware error');
    next(error);
  }
}

/**
 * Validate idempotency key format
 */
function isValidIdempotencyKey(key: string): boolean {
  // Format: scope_timestamp_random
  const parts = key.split('_');
  return parts.length >= 3 && !isNaN(Number(parts[1]));
}

/**
 * Generate scope for idempotency key
 */
function generateScope(req: Request): string {
  // Use user ID if authenticated, otherwise use IP
  const identifier = req.user?.id || req.ip || 'anonymous';
  const operation = req.path.split('/').pop() || 'unknown';
  
  return `${operation}:${identifier}`;
}

/**
 * Save idempotency response
 * Call this after successful operation
 */
export async function saveIdempotencyResponse(
  req: Request,
  response: unknown
): Promise<void> {
  try {
    const reqWithRecord = req as Request & { idempotencyKeyRecord?: IdempotencyKey };
    if (!req.idempotencyKey || !reqWithRecord.idempotencyKeyRecord) {
      return;
    }
    
    const keyRecord = reqWithRecord.idempotencyKeyRecord;
    
    await keyRecord.update({
      status: 'completed',
      response_json: response as Record<string, unknown>,
    });
    
    logger.info(
      { idempotencyKey: req.idempotencyKey },
      'Idempotency response saved'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to save idempotency response');
  }
}

/**
 * Mark idempotency as failed
 * Call this if operation fails
 */
export async function markIdempotencyFailed(
  req: Request,
  error: Error
): Promise<void> {
  try {
    const reqWithRecord = req as Request & { idempotencyKeyRecord?: IdempotencyKey };
    if (!req.idempotencyKey || !reqWithRecord.idempotencyKeyRecord) {
      return;
    }
    
    const keyRecord = reqWithRecord.idempotencyKeyRecord;
    
    await keyRecord.update({
      status: 'failed',
      response_json: {
        error: error.message,
      },
    });
    
    logger.warn(
      { idempotencyKey: req.idempotencyKey, error: error.message },
      'Idempotency marked as failed'
    );
  } catch (err) {
    logger.error({ error: err }, 'Failed to mark idempotency as failed');
  }
}

/**
 * Required idempotency middleware
 * Requires idempotency key for critical operations (payments, etc.)
 */
export function requireIdempotency(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return next(
      new BadRequestError(
        'Idempotency key required for this operation. Include "Idempotency-Key" header.'
      )
    );
  }
  
  // Call regular idempotency guard
  idempotencyGuard(req, res, next);
}

