/**
 * Verification Service
 * Handles business verification and approval workflows
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Business, BusinessStatus, OnboardingStatus } from '../models/business.model';
import { BusinessVerification, VerificationStatus } from '../models/businessVerification.model';
import { BusinessDocument } from '../models/businessDocument.model';
import { User } from '../models/user.model';
import { BusinessSettings } from '../models/businessSettings.model';
import {
  NotFoundError,
  BadRequestError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { sendBusinessApproved } from './email.service';
import { Locale } from '../types/enums';
import { env } from '../config/env';
import {
  ApproveBusinessRequest,
  RejectBusinessRequest,
  SuspendBusinessRequest,
  UpdateVerificationRequest,
  AdminBusinessQueryParams,
} from '../validators/admin.validator';

/**
 * Approve business
 */
export async function approveBusiness(
  data: ApproveBusinessRequest,
  adminId: string
): Promise<{ business: Business; verification: BusinessVerification }> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Find business
    const business = await Business.findByPk(data.business_id as string, {
      include: [
        { model: User, as: 'owner' },
        { model: BusinessSettings, as: 'settings' },
      ],
      transaction,
    });

    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify business is in pending review
    if (business.status !== BusinessStatus.PENDING_REVIEW) {
      throw new BadRequestError(`Business is already ${business.status}`);
    }

    // Update business status
    await business.update(
      {
        status: BusinessStatus.APPROVED,
        onboarding_status: OnboardingStatus.LIVE,
      },
      { transaction }
    );

    // Create or update verification record
    let verification = await BusinessVerification.findOne({
      where: { business_id: business.id },
      transaction,
    });

    if (verification) {
      await verification.update(
        {
          status: VerificationStatus.APPROVED,
          notes: (data.notes as string | undefined) || undefined,
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
        { transaction }
      );
    } else {
      verification = await BusinessVerification.create(
        {
          business_id: business.id,
          status: VerificationStatus.APPROVED,
          notes: (data.notes as string | undefined) || undefined,
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
        { transaction }
      );
    }

    // Send approval email
    const owner = business.get('owner') as User | undefined;
    if (owner?.email) {
      try {
        const settings = business.get('settings') as BusinessSettings | undefined;
        const locale = (settings?.default_locale as Locale) || Locale.JA;
        const businessName = business.display_name_ja || business.display_name_en || business.slug;
        const businessUrl = `${env.APP_URL || 'http://localhost:4000'}/businesses/${business.slug}`;

        await sendBusinessApproved(owner.email, locale, {
          ownerName: owner.display_name || owner.given_name || owner.email,
          businessName,
          businessUrl,
        });
      } catch (error) {
        logger.error({ error, businessId: business.id }, 'Failed to send business approval email');
      }
    }

    logger.info({ businessId: business.id, adminId }, 'Business approved');

    return { business, verification };
  });
}

/**
 * Reject business
 */
export async function rejectBusiness(
  data: RejectBusinessRequest,
  adminId: string
): Promise<{ business: Business; verification: BusinessVerification }> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Find business
    const business = await Business.findByPk(data.business_id as string, {
      include: [{ model: User, as: 'owner' }],
      transaction,
    });

    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify business is in pending review
    if (business.status !== BusinessStatus.PENDING_REVIEW) {
      throw new BadRequestError(`Business is already ${business.status}`);
    }

    // Update business status (keep as pending_review but mark verification as rejected)
    // Business owner can resubmit after fixing issues

    // Create or update verification record
    let verification = await BusinessVerification.findOne({
      where: { business_id: business.id },
      transaction,
    });

    const rejectionNotes = (data.notes as string | undefined) || data.reason;
    if (verification) {
      await verification.update(
        {
          status: VerificationStatus.REJECTED,
          notes: rejectionNotes || undefined,
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
        { transaction }
      );
    } else {
      verification = await BusinessVerification.create(
        {
          business_id: business.id,
          status: VerificationStatus.REJECTED,
          notes: rejectionNotes || undefined,
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
        { transaction }
      );
    }

    // TODO: Send rejection email (template needs to be created)
    // For now, just log
    logger.info({ businessId: business.id, adminId, reason: data.reason }, 'Business rejected');

    return { business, verification };
  });
}

/**
 * Suspend business
 */
export async function suspendBusiness(
  data: SuspendBusinessRequest,
  adminId: string
): Promise<Business> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Find business
    const business = await Business.findByPk(data.business_id as string, { transaction });

    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify business is approved
    if (business.status !== BusinessStatus.APPROVED) {
      throw new BadRequestError('Only approved businesses can be suspended');
    }

    // Update business status
    await business.update(
      {
        status: BusinessStatus.SUSPENDED,
      },
      { transaction }
    );

    // Create verification record for suspension
    await BusinessVerification.create(
      {
        business_id: business.id,
        status: VerificationStatus.REJECTED, // Use rejected status for suspension record
        notes: `Suspended: ${data.reason}. ${data.notes || ''}`.trim(),
        reviewed_by: adminId,
        reviewed_at: new Date(),
      },
      { transaction }
    );

    logger.info({ businessId: business.id, adminId, reason: data.reason }, 'Business suspended');

    return business.reload({ transaction });
  });
}

/**
 * List businesses for admin review
 */
export async function listBusinessesForReview(
  query: AdminBusinessQueryParams
): Promise<{ businesses: Business[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  if (query.status) {
    where.status = query.status;
  }
  if (query.onboarding_status) {
    where.onboarding_status = query.onboarding_status;
  }
  if (query.vertical_id) {
    where.vertical_id = query.vertical_id;
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Business.findAndCountAll({
    where,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'email', 'display_name', 'given_name', 'family_name'] },
      { model: BusinessVerification, as: 'verifications', order: [['created_at', 'DESC']], limit: 1 },
      { model: BusinessDocument, as: 'documents', attributes: ['id', 'type', 'status', 'created_at'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    businesses: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get business for admin review
 */
export async function getBusinessForReview(businessId: string): Promise<Business> {
  const business = await Business.findByPk(businessId as string, {
    include: [
      { model: User, as: 'owner' },
      { model: BusinessSettings, as: 'settings' },
      { model: BusinessVerification, as: 'verifications', order: [['created_at', 'DESC']] },
      { model: BusinessDocument, as: 'documents' },
    ],
  });

  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  return business;
}

/**
 * Update verification status
 */
export async function updateVerification(
  data: UpdateVerificationRequest,
  adminId: string
): Promise<BusinessVerification> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const verification = await BusinessVerification.findByPk(data.verification_id as string, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    // Update verification status
    const updateData: {
      status: VerificationStatus;
      notes?: string;
      reviewed_by: string;
      reviewed_at: Date;
    } = {
      status: data.status,
      reviewed_by: adminId,
      reviewed_at: new Date(),
    };
    if (data.notes) {
      updateData.notes = data.notes as string;
    }
    await verification.update(updateData, { transaction });

    // If verification is approved, update business status
    if (data.status === VerificationStatus.APPROVED) {
      const business = verification.get('business') as Business | undefined;
      if (business && business.status === BusinessStatus.PENDING_REVIEW) {
        await business.update(
          {
            status: BusinessStatus.APPROVED,
            onboarding_status: OnboardingStatus.LIVE,
          },
          { transaction }
        );

        // Send approval email
        const owner = await User.findByPk(business.owner_id, { transaction });
        if (owner?.email) {
          try {
            const settings = await BusinessSettings.findOne({
              where: { business_id: business.id },
              transaction,
            });
            const locale = (settings?.default_locale as Locale) || Locale.JA;
            const businessName = business.display_name_ja || business.display_name_en || business.slug;
            const businessUrl = `${env.APP_URL || 'http://localhost:4000'}/businesses/${business.slug}`;

            await sendBusinessApproved(owner.email, locale, {
              ownerName: owner.display_name || owner.given_name || owner.email,
              businessName,
              businessUrl,
            });
          } catch (error) {
            logger.error({ error, businessId: business.id }, 'Failed to send business approval email');
          }
        }
      }
    }

    logger.info({ verificationId: verification.id, adminId, status: data.status }, 'Verification updated');

    return verification.reload({ transaction });
  });
}

