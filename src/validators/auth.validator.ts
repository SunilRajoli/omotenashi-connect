/**
 * Auth validation schemas
 * Zod schemas for authentication endpoints
 */

import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
} from '../utils/validators';
import { UserRole } from '../types/enums';

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Register request schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  family_name_kana: z.string().optional(),
  given_name_kana: z.string().optional(),
  phone: phoneSchema.optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

/**
 * Verify email request schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

/**
 * Resend verification email request schema
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationRequest = z.infer<typeof resendVerificationSchema>;

/**
 * Change password request schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

/**
 * Update profile request schema
 */
export const updateProfileSchema = z.object({
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  family_name_kana: z.string().optional(),
  given_name_kana: z.string().optional(),
  display_name: z.string().optional(),
  phone: phoneSchema.optional(),
  timezone: z.string().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

