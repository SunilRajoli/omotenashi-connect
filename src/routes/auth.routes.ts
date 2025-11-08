/**
 * Authentication Routes
 * API endpoints for user authentication
 */

import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  verifyEmailController,
  resendVerificationController,
  getMeController,
} from '../controllers/auth.controller';
import { authGuard } from '../middleware/authGuard';
import { authRateLimit, standardRateLimit } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  standardRateLimit,
  validateBody(registerSchema),
  registerController
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authRateLimit, // Stricter rate limit for login
  validateBody(loginSchema),
  loginController
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  standardRateLimit,
  validateBody(refreshTokenSchema),
  refreshTokenController
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Private
 */
router.post(
  '/logout',
  authGuard,
  standardRateLimit,
  logoutController
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimit, // Stricter rate limit to prevent abuse
  validateBody(forgotPasswordSchema),
  forgotPasswordController
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateBody(resetPasswordSchema),
  resetPasswordController
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
router.post(
  '/change-password',
  authGuard,
  standardRateLimit,
  validateBody(changePasswordSchema),
  changePasswordController
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  '/verify-email',
  standardRateLimit,
  validateBody(verifyEmailSchema),
  verifyEmailController
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validateBody(resendVerificationSchema),
  resendVerificationController
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authGuard,
  getMeController
);

export default router;

