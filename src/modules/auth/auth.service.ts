import { Op } from 'sequelize';
import { env } from '../../config/env.ts';
import { sendMail } from '../../config/mailer.ts';
import { User } from '../../models/User.ts';
import { Role } from '../../models/Role.ts';
import { UserRole } from '../../models/UserRole.ts';
import { RefreshToken } from '../../models/RefreshToken.ts';
import { EmailVerification } from '../../models/EmailVerification.ts';
import { PasswordReset } from '../../models/PasswordReset.ts';
import { hashPassword, comparePassword, newTokenPair } from '../../utils/crypto.js';
import { signAccess, signRefresh, verifyRefresh } from '../../utils/jwt.js';
import { ApiError } from '../../utils/http.js';

export class AuthService {
  /** Create user, send verify email, assign 'user' role. */
  static async signup(email: string, password: string, fullName?: string) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already in use');

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      fullName: fullName || null,
      locale: 'ja',
      status: 'active'
    });

    // Ensure base roles exist (user/owner/staff/admin)
    const userRole = await Role.findOne({ where: { key: 'user' } });
    if (userRole) await UserRole.create({ userId: user.id, roleId: userRole.id });

    // Email verification token
    const { raw, hash } = newTokenPair();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await EmailVerification.create({ userId: user.id, token: hash, expiresAt });

    const verifyUrl = `${env.APP_URL}/api/v1/auth/verify-email?token=${raw}`;
    await sendMail({
      to: email,
      subject: '[Omotenashi] Verify your email',
      text: `Welcome! Verify your email: ${verifyUrl}`,
      html: `<p>Welcome!</p><p>Verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`
    });

    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  /** Confirm email via token */
  static async verifyEmail(rawToken: string) {
    const hash = require('crypto').createHash('sha256').update(rawToken).digest('hex');
    const rec = await EmailVerification.findOne({
      where: { token: hash, consumedAt: { [Op.is]: null }, expiresAt: { [Op.gt]: new Date() } }
    });
    if (!rec) throw new ApiError(400, 'Invalid or expired token');

    const user = await User.findByPk(rec.userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.emailVerifiedAt = new Date();
    await user.save();

    rec.consumedAt = new Date();
    await rec.save();

    return { ok: true };
  }

  /** Email + password → access + refresh tokens */
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid email or password');

    const roleJunction = await UserRole.findOne({ where: { userId: user.id }, include: [Role] });
    const roleKey = (roleJunction as any)?.Role?.key || 'user';

    const accessToken = signAccess({ sub: user.id, role: roleKey });
    const refreshToken = signRefresh({ sub: user.id, role: roleKey });

    await RefreshToken.create({
      userId: user.id,
      token: require('crypto').createHash('sha256').update(refreshToken).digest('hex'),
      userAgent: undefined,
      ip: undefined,
      expiresAt: new Date(Date.now() + msToMillis(env.JWT_REFRESH_EXPIRES_IN))
    });

    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, emailVerified: !!user.emailVerifiedAt },
      tokens: { accessToken, refreshToken }
    };
  }

  /** Rotate refresh → new pair; revoke old */
  static async refresh(oldRefreshToken: string) {
    let payload: any;
    try {
      payload = verifyRefresh(oldRefreshToken);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const hashed = require('crypto').createHash('sha256').update(oldRefreshToken).digest('hex');
    const rec = await RefreshToken.findOne({ where: { token: hashed, revokedAt: { [Op.is]: null }, expiresAt: { [Op.gt]: new Date() } } });
    if (!rec) throw new ApiError(401, 'Refresh token revoked or expired');

    // rotate: revoke old
    rec.revokedAt = new Date();
    await rec.save();

    const roleKey = payload.role || 'user';
    const accessToken = signAccess({ sub: payload.sub, role: roleKey });
    const refreshToken = signRefresh({ sub: payload.sub, role: roleKey });

    await RefreshToken.create({
      userId: payload.sub,
      token: require('crypto').createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt: new Date(Date.now() + msToMillis(env.JWT_REFRESH_EXPIRES_IN))
    });

    return { accessToken, refreshToken };
  }

  /** Revoke current refresh token (on logout) */
  static async logout(refreshToken: string) {
    const hashed = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const rec = await RefreshToken.findOne({ where: { token: hashed, revokedAt: { [Op.is]: null } } });
    if (rec) {
      rec.revokedAt = new Date();
      await rec.save();
    }
    return { ok: true };
  }

  /** Forgot password → email link */
  static async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    // Do not reveal existence; still return ok
    if (user) {
      const { raw, hash } = newTokenPair();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30m
      await PasswordReset.create({ userId: user.id, token: hash, expiresAt });

      const resetUrl = `${env.APP_URL}/api/v1/auth/reset-password?token=${raw}`;
      await sendMail({
        to: email,
        subject: '[Omotenashi] Reset your password',
        text: `Reset password: ${resetUrl}`,
        html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      });
    }
    return { ok: true };
  }

  /** Reset via token */
  static async resetPassword(rawToken: string, newPassword: string) {
    const hash = require('crypto').createHash('sha256').update(rawToken).digest('hex');
    const rec = await PasswordReset.findOne({
      where: { token: hash, consumedAt: { [Op.is]: null }, expiresAt: { [Op.gt]: new Date() } }
    });
    if (!rec) throw new ApiError(400, 'Invalid or expired token');

    const user = await User.findByPk(rec.userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    rec.consumedAt = new Date();
    await rec.save();

    return { ok: true };
  }

  /** Get current user profile (lightweight) */
  static async me(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'fullName', 'locale', 'status', 'emailVerifiedAt', 'createdAt', 'updatedAt']
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }
}

// helpers
function msToMillis(expr: string) {
  // Supports "30d", "15m", "12h" etc.
  const m = expr.match(/^(\d+)([smhd])$/);
  if (!m) return 1000 * 60 * 60 * 24 * 30; // default 30d
  const n = Number(m[1]);
  const unit = m[2];
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * map[unit];
}
