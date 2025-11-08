/**
 * Idempotency utilities
 * Generate and validate idempotency keys for payment safety
 */

import { generateToken, hashToken } from './crypto';

/**
 * Generate idempotency key
 * Format: {scope}_{timestamp}_{random}
 */
export function generateIdempotencyKey(scope: string): string {
  const timestamp = Date.now();
  const random = generateToken(16);
  return `${scope}_${timestamp}_${random}`;
}

/**
 * Hash idempotency key for storage
 */
export function hashIdempotencyKey(key: string): string {
  return hashToken(key);
}

/**
 * Parse idempotency key
 */
export interface IdempotencyKeyParts {
  scope: string;
  timestamp: number;
  random: string;
}

export function parseIdempotencyKey(key: string): IdempotencyKeyParts {
  const parts = key.split('_');
  if (parts.length < 3) {
    throw new Error('Invalid idempotency key format');
  }
  
  const scope = parts[0];
  const timestamp = parseInt(parts[1], 10);
  const random = parts.slice(2).join('_');
  
  if (isNaN(timestamp)) {
    throw new Error('Invalid timestamp in idempotency key');
  }
  
  return { scope, timestamp, random };
}

/**
 * Check if idempotency key is expired
 * Default expiry: 24 hours
 */
export function isIdempotencyKeyExpired(
  key: string,
  expiryHours: number = 24
): boolean {
  try {
    const { timestamp } = parseIdempotencyKey(key);
    const expiryTime = timestamp + expiryHours * 60 * 60 * 1000;
    return Date.now() > expiryTime;
  } catch {
    return true; // Invalid keys are considered expired
  }
}

/**
 * Validate idempotency key format
 */
export function isValidIdempotencyKey(key: string): boolean {
  try {
    parseIdempotencyKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create idempotency key for payment
 */
export function createPaymentIdempotencyKey(bookingId: string): string {
  return generateIdempotencyKey(`payment_${bookingId}`);
}

/**
 * Create idempotency key for booking
 */
export function createBookingIdempotencyKey(businessId: string): string {
  return generateIdempotencyKey(`booking_${businessId}`);
}

