/**
 * Media Service
 * Handles business media management
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { BusinessMedia } from '../models/businessMedia.model';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { uploadFile, deleteFile, generateMediaKey, extractKeyFromUrl } from './storage.service';
import {
  CreateMediaRequest,
  UpdateMediaRequest,
  MediaQueryParams,
} from '../validators/media.validator';

/**
 * Upload and create media
 */
export async function createMedia(
  businessId: string,
  file: Express.Multer.File,
  data: CreateMediaRequest,
  userId: string
): Promise<BusinessMedia> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(businessId, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control: only owners and admins can upload media
    if (business.owner_id !== userId) {
      // Check if user is admin
      const user = await User.findByPk(userId, { transaction });
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('You can only upload media for your own businesses');
      }
    }

    // Validate file type matches request type
    const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
    if (data.type !== fileType) {
      throw new BadRequestError(`File type does not match requested type: ${data.type}`);
    }

    // Generate S3 key
    const key = generateMediaKey(businessId, file.originalname, data.type);

    // Upload to S3
    const { url } = await uploadFile(file, key, file.mimetype);

    // Get current max display order
    const maxOrderResult = await BusinessMedia.max('display_order', {
      where: {
        business_id: businessId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      transaction,
    });
    const maxOrder = typeof maxOrderResult === 'number' ? maxOrderResult : 0;

    // Create media record
    const media = await BusinessMedia.create(
      {
        business_id: businessId,
        type: data.type,
        url,
        caption_ja: data.caption_ja,
        caption_en: data.caption_en,
        display_order: data.display_order ?? (maxOrder + 1),
        is_featured: data.is_featured || false,
        uploaded_by: userId,
      },
      { transaction }
    );

    logger.info({ mediaId: media.id, businessId, type: data.type }, 'Media created');

    return media.reload({
      include: [
        { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
        { model: User, as: 'uploader', attributes: ['id', 'email', 'display_name'] },
      ],
      transaction,
    });
  });
}

/**
 * List media
 */
export async function listMedia(
  query: MediaQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ media: BusinessMedia[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.is_featured !== undefined) {
    where.is_featured = query.is_featured;
  }

  // Access control: owners can only see media for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { media: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    where.business_id = { [Op.in]: businessIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await BusinessMedia.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      { model: User, as: 'uploader', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['display_order', 'ASC'], ['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    media: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get media by ID
 */
export async function getMediaById(
  mediaId: string,
  userId?: string,
  userRole?: string
): Promise<BusinessMedia> {
  const media = await BusinessMedia.findByPk(mediaId, {
    include: [
      { model: Business, as: 'business' },
      { model: User, as: 'uploader', attributes: ['id', 'email', 'display_name'] },
    ],
  });

  if (!media || media.deleted_at) {
    throw new NotFoundError('Media not found');
  }

  // Access control: owners can only see media for their businesses
  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(media.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view media for your businesses');
    }
  }

  return media;
}

/**
 * Update media
 */
export async function updateMedia(
  mediaId: string,
  data: UpdateMediaRequest,
  userId: string,
  userRole: string
): Promise<BusinessMedia> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const media = await BusinessMedia.findByPk(mediaId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!media || media.deleted_at) {
      throw new NotFoundError('Media not found');
    }

    // Access control: only owners and admins can update media
    const business = media.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only update media for your own businesses');
      }
    }

    // Update media
    await media.update(
      {
        caption_ja: data.caption_ja ?? media.caption_ja,
        caption_en: data.caption_en ?? media.caption_en,
        display_order: data.display_order ?? media.display_order,
        is_featured: data.is_featured ?? media.is_featured,
      },
      { transaction }
    );

    logger.info({ mediaId, userId }, 'Media updated');

    return media.reload({
      include: [
        { model: Business, as: 'business' },
        { model: User, as: 'uploader' },
      ],
      transaction,
    });
  });
}

/**
 * Delete media
 */
export async function deleteMedia(
  mediaId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const media = await BusinessMedia.findByPk(mediaId, {
      include: [{ model: Business, as: 'business' }],
      transaction,
    });

    if (!media || media.deleted_at) {
      throw new NotFoundError('Media not found');
    }

    // Access control: only owners and admins can delete media
    const business = media.get('business') as Business | undefined;
    if (business) {
      if (business.owner_id !== userId && userRole !== 'admin') {
        throw new ForbiddenError('You can only delete media for your own businesses');
      }
    }

    // Delete from S3
    try {
      const key = extractKeyFromUrl(media.url);
      await deleteFile(key);
    } catch (error) {
      logger.warn({ error, mediaId }, 'Failed to delete file from S3, continuing with soft delete');
    }

    // Soft delete
    await media.update(
      {
        deleted_at: new Date(),
      },
      { transaction }
    );

    logger.info({ mediaId, userId }, 'Media deleted');
  });
}

/**
 * Reorder media
 */
export async function reorderMedia(
  businessId: string,
  mediaIds: string[],
  userId: string,
  userRole: string
): Promise<BusinessMedia[]> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(businessId, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Access control: only owners and admins can reorder media
    if (business.owner_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only reorder media for your own businesses');
    }

    // Update display order for each media
    const updatedMedia: BusinessMedia[] = [];
    for (let i = 0; i < mediaIds.length; i++) {
      const media = await BusinessMedia.findOne({
        where: {
          id: mediaIds[i],
          business_id: businessId,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        transaction,
      });

      if (media) {
        await media.update({ display_order: i + 1 }, { transaction });
        updatedMedia.push(media);
      }
    }

    logger.info({ businessId, userId, count: updatedMedia.length }, 'Media reordered');

    return updatedMedia;
  });
}

