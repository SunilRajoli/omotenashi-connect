/**
 * Express type extensions
 * Extends Express Request/Response with custom properties
 */

import { UserRole } from './enums';
import { Business } from '../models/business.model';

declare global {
  namespace Express {
    interface Request {
      // User information (set by authGuard middleware)
      user?: {
        id: string;
        email: string;
        role: UserRole;
        businessId?: string; // For staff/owner roles
      };
      
      // Business context (set by tenantGuard middleware)
      business?: Business;
      
      // Request metadata
      requestId?: string; // Unique request ID for tracing
      locale?: 'ja' | 'en'; // Detected locale
      ip?: string; // Client IP address
      
      // Rate limiting
      rateLimit?: {
        remaining: number;
        reset: Date;
      };
      
      // Idempotency
      idempotencyKey?: string;
      
      // File upload (multer)
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }

    export interface Response {
      // Custom response helpers
      success?: (data: unknown, message?: string) => void;
      error?: (error: Error | string, statusCode?: number) => void;
    }
  }
}

export {};

