import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function hashPassword(plain: string) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}
export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// Random token (URL safe) + sha256 hash for DB storage
export function newTokenPair(bytes = 32) {
  const raw = crypto.randomBytes(bytes).toString('hex'); // 64 hex
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
