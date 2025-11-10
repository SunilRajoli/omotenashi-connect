/**
 * LINE Routes
 * API endpoints for LINE integration
 */

import { Router } from 'express';
import {
  linkLineAccountController,
  unlinkLineAccountController,
  getLineAccountStatusController,
  lineWebhookController,
} from '../controllers/line.controller';
import { authGuard } from '../middleware/authGuard';
import { validateBody } from '../middleware/validation';
import { linkLineAccountSchema } from '../validators/line.validator';
import { lineMiddleware } from '../config/line';

const router = Router();

/**
 * @route   POST /api/v1/line/link
 * @desc    Link LINE account to user
 * @access  Private
 */
router.post(
  '/link',
  authGuard,
  validateBody(linkLineAccountSchema),
  linkLineAccountController
);

/**
 * @route   DELETE /api/v1/line/unlink
 * @desc    Unlink LINE account from user
 * @access  Private
 */
router.delete('/unlink', authGuard, unlinkLineAccountController);

/**
 * @route   GET /api/v1/line/status
 * @desc    Get LINE account status
 * @access  Private
 */
router.get('/status', authGuard, getLineAccountStatusController);

/**
 * @route   POST /api/v1/line/webhook
 * @desc    LINE webhook handler
 * @access  Public (LINE servers only)
 */
if (lineMiddleware) {
  router.post('/webhook', lineMiddleware, lineWebhookController);
} else {
  router.post('/webhook', (req, res) => {
    res.status(503).json({
      status: 'error',
      message: 'LINE webhook is not configured',
    });
  });
}

export default router;

