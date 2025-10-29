import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.ts';

type RoleKey = 'user' | 'owner' | 'staff' | 'admin';

export interface AccessPayload extends JwtPayload {
  sub: string;
  role?: RoleKey;
}

/** Convert "15m", "12h", "30d" or "900" to seconds (number). */
function parseExpiresToSeconds(value: string): number {
  const trimmed = String(value).trim();
  // numeric string -> seconds
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  //  e.g. 15m, 12h, 30d, 45s
  const m = trimmed.match(/^(\d+)\s*([smhd])$/i);
  if (!m) throw new Error(`Invalid JWT expires format: "${value}"`);
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * map[unit];
}

const accessExpiresSec = parseExpiresToSeconds(env.JWT_EXPIRES_IN);         // number
const refreshExpiresSec = parseExpiresToSeconds(env.JWT_REFRESH_EXPIRES_IN); // number

const accessOpts: SignOptions = { expiresIn: accessExpiresSec };
const refreshOpts: SignOptions = { expiresIn: refreshExpiresSec };

const accessSecret: Secret = env.JWT_SECRET;
const refreshSecret: Secret = env.JWT_REFRESH_SECRET;

export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, accessSecret, accessOpts);
}
export function signRefresh(payload: AccessPayload): string {
  return jwt.sign(payload, refreshSecret, refreshOpts);
}
export function verifyAccess<T extends JwtPayload = AccessPayload>(token: string): T {
  return jwt.verify(token, accessSecret) as T;
}
export function verifyRefresh<T extends JwtPayload = AccessPayload>(token: string): T {
  return jwt.verify(token, refreshSecret) as T;
}
