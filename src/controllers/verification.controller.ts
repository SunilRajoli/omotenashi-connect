/**
 * Verification Controller
 * Handles business verification HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { updateVerification } from '../services/verification.service';
import { getSuccessMessage, getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';
import { UpdateVerificationRequest } from '../validators/admin.validator';

/**
 * Update verification status
 * PUT /api/v1/admin/verifications/:id
 */
export async function updateVerificationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const locale = getLocale(req);
    const { id } = req.params;
    const data: UpdateVerificationRequest = { ...req.body, verification_id: id };
    const adminId = req.user?.id;

    if (!adminId || req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: getMessage('auth.forbidden', locale),
      });
      return;
    }

    const verification = await updateVerification(data, adminId);

    res.status(200).json({
      status: 'success',
      message: getSuccessMessage('updated', locale),
      data: { verification },
    });
  } catch (error) {
    next(error);
  }
}

