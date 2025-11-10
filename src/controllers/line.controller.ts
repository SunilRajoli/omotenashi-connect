/**
 * LINE Controller
 * Handles LINE-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  linkLineAccount,
  unlinkLineAccount,
  getLineUserByUserId,
} from '../services/line.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { LinkLineAccountRequest } from '../validators/line.validator';
import { BadRequestError } from '../utils/httpErrors';

/**
 * Link LINE account to user
 * POST /api/v1/line/link
 */
export async function linkLineAccountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { line_user_id } = req.body as LinkLineAccountRequest;
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const lineUser = await linkLineAccount(userId, line_user_id);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('line_account_linked', locale),
      data: {
        line_user: {
          id: lineUser.id,
          line_user_id: lineUser.line_user_id,
          display_name: lineUser.display_name,
          picture_url: lineUser.picture_url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unlink LINE account from user
 * DELETE /api/v1/line/unlink
 */
export async function unlinkLineAccountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    await unlinkLineAccount(userId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('line_account_unlinked', locale),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get LINE account status
 * GET /api/v1/line/status
 */
export async function getLineAccountStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const locale = getLocale(req);

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const lineUser = await getLineUserByUserId(userId);

    res.status(200).json({
      status: 'success',
      message: getMessage('line_account_status', locale),
      data: {
        linked: !!lineUser,
        line_user: lineUser
          ? {
              id: lineUser.id,
              line_user_id: lineUser.line_user_id,
              display_name: lineUser.display_name,
              picture_url: lineUser.picture_url,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * LINE webhook handler
 * POST /api/v1/line/webhook
 */
export async function lineWebhookController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // LINE webhook events are handled by LINE SDK middleware
    // This controller processes the events
    const events = req.body.events || [];

    // Process events (messages, follows, unfollows, etc.)
    for (const event of events) {
      // Handle different event types
      if (event.type === 'message') {
        // Handle message events
        // Implementation depends on business requirements
      } else if (event.type === 'follow') {
        // Handle follow events
      } else if (event.type === 'unfollow') {
        // Handle unfollow events
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
}

