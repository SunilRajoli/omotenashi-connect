/**
 * Authentication Controller
 * HTTP handlers for authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifyEmail,
  resendEmailVerification,
} from '../services/auth.service';
import { toHttpError } from '../utils/httpErrors';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

/**
 * Register new user
 * POST /api/auth/register
 */
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { user, tokens } = await register(req.body);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          family_name: user.family_name,
          given_name: user.given_name,
          display_name: user.display_name,
          created_at: user.created_at,
        },
        ...tokens,
      },
      message: getSuccessMessage('register', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { user, tokens } = await login(req.body);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          family_name: user.family_name,
          given_name: user.given_name,
          display_name: user.display_name,
          is_active: user.is_active,
        },
        ...tokens,
      },
      message: getSuccessMessage('login', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: getMessage('auth.refresh_token.required', locale),
      });
      return;
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
      message: getSuccessMessage('refresh', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const { refreshToken } = req.body;

    if (refreshToken) {
      await logout(refreshToken, req.user.id);
    }

    res.json({
      success: true,
      message: getSuccessMessage('logout', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { email } = req.body;

    // Always return success (security best practice - don't reveal if user exists)
    await requestPasswordReset(email);

    res.json({
      success: true,
      message: getSuccessMessage('forgot_password', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { token, password } = req.body;

    await resetPassword(token, password);

    res.json({
      success: true,
      message: getSuccessMessage('reset_password', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Change password (authenticated)
 * POST /api/auth/change-password
 */
export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    await changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: getSuccessMessage('change_password', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Verify email
 * POST /api/auth/verify-email
 */
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { token } = req.body;

    await verifyEmail(token);

    res.json({
      success: true,
      message: getSuccessMessage('verify_email', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Resend email verification
 * POST /api/auth/resend-verification
 */
export async function resendVerificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { email } = req.body;

    await resendEmailVerification(email);

    res.json({
      success: true,
      message: getSuccessMessage('resend_verification', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: getMessage('auth.unauthorized', locale),
      });
      return;
    }

    // User is already attached to request by authGuard
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        businessId: req.user.businessId,
      },
      message: getSuccessMessage('me', locale),
    });
  } catch (error) {
    next(toHttpError(error));
  }
}

