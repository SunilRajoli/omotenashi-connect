/**
 * Notification Service
 * Handles notification management and preferences
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { NotificationOutbox, DeliveryStatus } from '../models/notificationOutbox.model';
import { User } from '../models/user.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import { Locale, NotificationTone } from '../types/enums';
import {
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationQueryParams,
  UpdateNotificationPreferencesRequest,
} from '../validators/notification.validator';
import { addEmailJob } from '../jobs/queues';

/**
 * Create notification
 */
export async function createNotification(
  data: CreateNotificationRequest,
  _userId?: string
): Promise<NotificationOutbox> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Validate that at least one recipient is provided
    if (!data.to_email && !data.to_phone) {
      throw new BadRequestError('Either email or phone must be provided');
    }

    // Create notification outbox record
    const notification = await NotificationOutbox.create(
      {
        kind: data.kind,
        to_email: data.to_email,
        to_phone: data.to_phone,
        locale: data.locale || Locale.JA,
        tone: data.tone || NotificationTone.POLITE,
        template: data.template,
        data_json: data.data_json,
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        delivery_status: DeliveryStatus.QUEUED,
        attempts: 0,
      },
      { transaction }
    );

    // If scheduled for immediate delivery (or no schedule), queue email job
    if (!data.scheduled_at || new Date(data.scheduled_at) <= new Date()) {
      if (data.to_email) {
        try {
          await addEmailJob({
            to: data.to_email,
            subject: (data.data_json.subject as string) || 'Notification',
            html: (data.data_json.html as string) || '',
            locale: data.locale || Locale.JA,
            scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
            notificationId: notification.id,
          });
        } catch (error) {
          logger.error({ error, notificationId: notification.id }, 'Failed to queue email job');
          // Update notification status
          await notification.update(
            {
              delivery_status: DeliveryStatus.FAILED,
              error_message: error instanceof Error ? error.message : 'Failed to queue email',
            },
            { transaction }
          );
        }
      }
    }

    logger.info({ notificationId: notification.id, kind: data.kind }, 'Notification created');

    return notification.reload({ transaction });
  });
}

/**
 * List notifications
 */
export async function listNotifications(
  query: NotificationQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ notifications: NotificationOutbox[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {};

  if (query.kind) {
    where.kind = query.kind;
  }
  if (query.to_email) {
    where.to_email = query.to_email;
  }
  if (query.delivery_status) {
    where.delivery_status = query.delivery_status;
  }

  // Date range filter
  if (query.start_date || query.end_date) {
    const dateFilter: { [Op.gte]?: Date; [Op.lte]?: Date } = {};
    if (query.start_date) {
      dateFilter[Op.gte] = new Date(`${query.start_date}T00:00:00Z`);
    }
    if (query.end_date) {
      dateFilter[Op.lte] = new Date(`${query.end_date}T23:59:59Z`);
    }
    where.created_at = dateFilter;
  }

  // Access control: users can only see their own notifications
  if (userRole !== 'admin' && userId) {
    const user = await User.findByPk(userId);
    if (user && user.email) {
      where.to_email = user.email;
    } else {
      // If user has no email, return empty
      return { notifications: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await NotificationOutbox.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    notifications: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get notification by ID
 */
export async function getNotificationById(
  notificationId: string,
  userId?: string,
  userRole?: string
): Promise<NotificationOutbox> {
  const notification = await NotificationOutbox.findByPk(notificationId);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  // Access control: users can only see their own notifications
  if (userRole !== 'admin' && userId) {
    const user = await User.findByPk(userId);
    if (!user || !user.email || notification.to_email !== user.email) {
      throw new ForbiddenError('You can only view your own notifications');
    }
  }

  return notification;
}

/**
 * Update notification
 */
export async function updateNotification(
  notificationId: string,
  data: UpdateNotificationRequest,
  userId: string,
  userRole: string
): Promise<NotificationOutbox> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const notification = await NotificationOutbox.findByPk(notificationId, { transaction });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Access control: only admins can update notifications
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can update notifications');
    }

    // Update notification
    await notification.update(
      {
        delivery_status: data.delivery_status ?? notification.delivery_status,
        error_message: data.error_message ?? notification.error_message,
      },
      { transaction }
    );

    logger.info({ notificationId, userId }, 'Notification updated');

    return notification.reload({ transaction });
  });
}

/**
 * Retry failed notification
 */
export async function retryNotification(
  notificationId: string,
  userId: string,
  userRole: string
): Promise<NotificationOutbox> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const notification = await NotificationOutbox.findByPk(notificationId, { transaction });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Access control: only admins can retry notifications
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can retry notifications');
    }

    // Only retry failed notifications
    if (notification.delivery_status !== DeliveryStatus.FAILED) {
      throw new BadRequestError('Can only retry failed notifications');
    }

    // Reset notification status
    await notification.update(
      {
        delivery_status: DeliveryStatus.QUEUED,
        error_message: undefined,
      },
      { transaction }
    );

    // Queue email job if email exists
    if (notification.to_email) {
      try {
        await addEmailJob({
          to: notification.to_email,
          subject: (notification.data_json.subject as string) || 'Notification',
          html: (notification.data_json.html as string) || '',
          locale: notification.locale as Locale || Locale.JA,
          scheduledAt: notification.scheduled_at || undefined,
          notificationId: notification.id,
        });
      } catch (error) {
        logger.error({ error, notificationId }, 'Failed to queue email job for retry');
        await notification.update(
          {
            delivery_status: DeliveryStatus.FAILED,
            error_message: error instanceof Error ? error.message : 'Failed to queue email',
          },
          { transaction }
        );
      }
    }

    logger.info({ notificationId, userId }, 'Notification retry queued');

    return notification.reload({ transaction });
  });
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<{
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_reminders: boolean;
  payment_notifications: boolean;
  review_requests: boolean;
  marketing_emails: boolean;
}> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // For now, return defaults (can be extended to store in user preferences table)
  return {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    booking_reminders: true,
    payment_notifications: true,
    review_requests: true,
    marketing_emails: false,
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  data: UpdateNotificationPreferencesRequest
): Promise<{
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_reminders: boolean;
  payment_notifications: boolean;
  review_requests: boolean;
  marketing_emails: boolean;
}> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // For now, just return the updated preferences
  // In a full implementation, this would be stored in a user_preferences table
  const current = await getNotificationPreferences(userId);
  const updated = {
    email_enabled: data.email_enabled ?? current.email_enabled,
    sms_enabled: data.sms_enabled ?? current.sms_enabled,
    push_enabled: data.push_enabled ?? current.push_enabled,
    booking_reminders: data.booking_reminders ?? current.booking_reminders,
    payment_notifications: data.payment_notifications ?? current.payment_notifications,
    review_requests: data.review_requests ?? current.review_requests,
    marketing_emails: data.marketing_emails ?? current.marketing_emails,
  };

  logger.info({ userId, preferences: updated }, 'Notification preferences updated');

  return updated;
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(
  userId?: string,
  userRole?: string
): Promise<{
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
}> {
  const where: WhereOptions = {};

  // Access control: users can only see stats for their own notifications
  if (userRole !== 'admin' && userId) {
    const user = await User.findByPk(userId);
    if (user && user.email) {
      where.to_email = user.email;
    } else {
      return { total: 0, queued: 0, sent: 0, delivered: 0, failed: 0, bounced: 0 };
    }
  }

  const total = await NotificationOutbox.count({ where });

  const queued = await NotificationOutbox.count({
    where: { ...where, delivery_status: DeliveryStatus.QUEUED },
  });

  const sent = await NotificationOutbox.count({
    where: { ...where, delivery_status: DeliveryStatus.SENT },
  });

  const delivered = await NotificationOutbox.count({
    where: { ...where, delivery_status: DeliveryStatus.DELIVERED },
  });

  const failed = await NotificationOutbox.count({
    where: { ...where, delivery_status: DeliveryStatus.FAILED },
  });

  const bounced = await NotificationOutbox.count({
    where: { ...where, delivery_status: DeliveryStatus.BOUNCED },
  });

  return {
    total,
    queued,
    sent,
    delivered,
    failed,
    bounced,
  };
}

