/**
 * Cryptographic utilities
 * Password hashing, token generation, secure random strings
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Bcrypt salt rounds
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 * @param length - Length of token in bytes (default: 32)
 * @returns Hex-encoded token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure random token for email verification
 */
export function generateEmailToken(): string {
  return generateToken(32);
}

/**
 * Generate a secure random token for password reset
 */
export function generatePasswordResetToken(): string {
  return generateToken(32);
}

/**
 * Hash a token for storage (SHA-256)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure random string for API keys
 */
export function generateApiKey(prefix: string = 'omt'): string {
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${randomPart}`;
}

/**
 * Create HMAC signature
 */
export function createHmacSignature(
  data: string,
  secret: string
): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmacSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Encrypt sensitive data (AES-256-GCM)
 */
export function encrypt(data: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    iv
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data (AES-256-GCM)
 */
export function decrypt(encryptedData: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

