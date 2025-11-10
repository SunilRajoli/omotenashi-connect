/**
 * Deposit Controller
 * Handles deposit-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import {
  getDepositAmount,
  getDepositPaymentStatus,
  isDepositRequired,
  isDepositDue,
} from '../services/deposit.service';
import { getMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

/**
 * Get deposit information for booking
 * GET /api/v1/bookings/:id/deposit
 */
export async function getDepositInfoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    const depositInfo = await getDepositAmount(id);
    const paymentStatus = await getDepositPaymentStatus(id);
    const depositRequired = await isDepositRequired(id);
    const depositDue = await isDepositDue(id);

    res.status(200).json({
      status: 'success',
      message: getMessage('deposit_info_retrieved', locale),
      data: {
        deposit_required: depositRequired,
        deposit_due: depositDue,
        deposit_amount: depositInfo.depositAmount,
        balance_amount: depositInfo.balanceAmount,
        total_amount: depositInfo.totalAmount,
        deposit_percentage: depositInfo.depositPercentage,
        payment_status: paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get deposit payment status
 * GET /api/v1/bookings/:id/deposit/status
 */
export async function getDepositStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const locale = getLocale(req);

    const paymentStatus = await getDepositPaymentStatus(id);

    res.status(200).json({
      status: 'success',
      message: getMessage('deposit_status_retrieved', locale),
      data: paymentStatus,
    });
  } catch (error) {
    next(error);
  }
}

