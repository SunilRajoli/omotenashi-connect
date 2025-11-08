/**
 * Authentication Service
 * Handles user authentication, registration, password management
 */

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { EmailVerification } from '../models/emailVerification.model';
import { PasswordReset } from '../models/passwordReset.model';
import { UserRole } from '../types/enums';
import { env } from '../config/env';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  hashToken,
} from '../utils/crypto';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  family_name?: string;
  given_name?: string;
  family_name_kana?: string;
  given_name_kana?: string;
  phone?: string;
  role?: UserRole;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AccessPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  businessId?: string;
  type: 'access';
}

interface RefreshPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'refresh';
}

/**
 * Generate JWT access token
 */
function generateAccessToken(
  userId: string,
  email: string,
  role: UserRole,
  businessId?: string
): string {
  const payload: AccessPayload = {
    userId,
    email,
    role,
    businessId,
    type: 'access',
  };
  const options: SignOptions = {
    // Cast to the exact type jsonwebtoken expects
    expiresIn: env.JWT_ACCESS_EXPIRES as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(
  userId: string,
  email: string,
  role: UserRole
): string {
  const payload: RefreshPayload = {
    userId,
    email,
    role,
    type: 'refresh',
  };
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

/**
 * Register a new user
 */
export async function register(
  data: RegisterData
): Promise<{ user: User; tokens: TokenPair }> {
  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await User.create({
    email: data.email.toLowerCase(),
    password_hash: passwordHash,
    family_name: data.family_name,
    given_name: data.given_name,
    family_name_kana: data.family_name_kana,
    given_name_kana: data.given_name_kana,
    phone: data.phone,
    role: data.role || UserRole.CUSTOMER,
    timezone: 'Asia/Tokyo',
    is_active: true,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  // Create email verification token (user needs to verify email)
  await createEmailVerificationToken(user.id, user.email);

  logger.info({ userId: user.id, email: user.email }, 'User registered');

  return {
    user,
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Login user
 */
export async function login(
  credentials: LoginCredentials
): Promise<{ user: User; tokens: TokenPair }> {
  const user = await User.findOne({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.deleted_at) {
    throw new UnauthorizedError('User account has been deleted');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('User account is inactive');
  }

  const isValid = await verifyPassword(credentials.password, user.password_hash);
  if (!isValid) {
    logger.warn({ email: credentials.email }, 'Failed login attempt');
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  await storeRefreshToken(user.id, refreshToken);

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  return {
    user,
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  refreshTokenString: string
): Promise<TokenPair> {
  try {
    const payload = jwt.verify(
      refreshTokenString,
      env.JWT_REFRESH_SECRET
    ) as RefreshPayload;

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Check if refresh token exists in database
    const tokenHash = hashToken(refreshTokenString);
    const whereRT: WhereOptions = {
      user_id: payload.userId,
      token_hash: tokenHash,
      expires_at: { [Op.gt]: new Date() },
    };
    const stored = await RefreshToken.findOne({ where: whereRT });

    if (!stored) {
      throw new UnauthorizedError('Refresh token not found or expired');
    }

    // Get user
    const user = await User.findByPk(payload.userId);
    if (!user || user.deleted_at || !user.is_active) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(
      user.id,
      user.email,
      user.role
    );

    await stored.destroy(); // revoke old
    await storeRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw error;
  }
}

/**
 * Logout user (revoke refresh token)
 */
export async function logout(
  refreshTokenString: string,
  userId: string
): Promise<void> {
  const tokenHash = hashToken(refreshTokenString);

  await RefreshToken.destroy({
    where: { user_id: userId, token_hash: tokenHash },
  });

  logger.info({ userId }, 'User logged out');
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Do not reveal whether the user exists
    logger.info({ email }, 'Password reset requested for non-existent user');
    return;
  }

  await createPasswordResetToken(user.id, user.email);

  logger.info({ userId: user.id, email: user.email }, 'Password reset requested');
}

/**
 * Reset password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const wherePR: WhereOptions = {
    token_hash: hashToken(token),
    expires_at: { [Op.gt]: new Date() },
    used_at: null, // no `as any`
  };

  const resetToken = await PasswordReset.findOne({ where: wherePR });

  if (!resetToken) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  const user = await User.findByPk(resetToken.user_id);
  if (!user || user.deleted_at) {
    throw new NotFoundError('User not found');
  }

  const passwordHash = await hashPassword(newPassword);
  await user.update({ password_hash: passwordHash });

  await resetToken.update({ used_at: new Date() });

  // Invalidate all refresh tokens for the user
  await RefreshToken.destroy({ where: { user_id: user.id } });

  logger.info({ userId: user.id }, 'Password reset completed');
}

/**
 * Change password (for authenticated users)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findByPk(userId);

  if (!user || user.deleted_at) {
    throw new NotFoundError('User not found');
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const passwordHash = await hashPassword(newPassword);
  await user.update({ password_hash: passwordHash });

  logger.info({ userId }, 'Password changed');
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<void> {
  const whereEV: WhereOptions = {
    token_hash: hashToken(token),
    expires_at: { [Op.gt]: new Date() },
    verified_at: null, // no `as any`
  };

  const verificationToken = await EmailVerification.findOne({ where: whereEV });

  if (!verificationToken) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  const user = await User.findByPk(verificationToken.user_id);
  if (!user || user.deleted_at) {
    throw new NotFoundError('User not found');
  }

  await verificationToken.update({ verified_at: new Date() });

  logger.info({ userId: user.id }, 'Email verified');
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<void> {
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await createEmailVerificationToken(user.id, user.email);

  logger.info({ userId: user.id }, 'Email verification resent');
}

/**
 * Store refresh token in database
 */
async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await RefreshToken.create({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });
}

/**
 * Create email verification token
 */
async function createEmailVerificationToken(
  userId: string,
  _email: string
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

  // Mark old tokens as verified (close open ones)
  const whereOld: WhereOptions = { user_id: userId, verified_at: null };
  await EmailVerification.update({ verified_at: new Date() }, { where: whereOld });

  await EmailVerification.create({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });

  return token;
}

/**
 * Create password reset token
 */
async function createPasswordResetToken(
  userId: string,
  _email: string
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

  // Mark old tokens as used (close open ones)
  const whereOld: WhereOptions = { user_id: userId, used_at: null };
  await PasswordReset.update({ used_at: new Date() }, { where: whereOld });

  await PasswordReset.create({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });

  return token;
}
