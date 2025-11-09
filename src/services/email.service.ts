/**
 * Email Service
 * Handles email template rendering and sending via SendGrid
 */

import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { addEmailJob } from '../jobs/queues';
import { Locale } from '../types/enums';

// SendGrid integration (optional - can be mocked in dev/test)
// We use dynamic require to avoid compile-time dependency

interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string; // e.g., 'verify_email', 'reset_password'
  locale?: Locale;
  data: EmailTemplateData;
  scheduledAt?: Date;
}

/**
 * Load and render email template
 */
function renderTemplate(
  templateName: string,
  locale: Locale,
  data: EmailTemplateData
): string {
  const templatePath = path.join(
    __dirname,
    '../../src/templates/email',
    `${templateName}.${locale}.html`
  );

  try {
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Replace template variables {{variable_name}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value || ''));
    });

    return html;
  } catch (error) {
    logger.error({ templatePath, error }, 'Failed to load email template');
    throw new Error(`Email template not found: ${templateName}.${locale}.html`);
  }
}

/**
 * Send email via SendGrid (or log in dev/test)
 */
async function sendEmailViaProvider(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!env.SENDGRID_API_KEY) {
    // Development/test mode - just log
    logger.info(
      {
        to,
        subject,
        htmlLength: html.length,
      },
      'Email would be sent (SendGrid not configured)'
    );
    return;
  }

  try {
    // Dynamic require to avoid compile-time dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(env.SENDGRID_API_KEY);

    await sgMail.send({
      to,
      from: {
        email: env.FROM_EMAIL,
        name: env.FROM_NAME,
      },
      subject,
      html,
    });

    logger.info({ to, subject }, 'Email sent via SendGrid');
  } catch (error) {
    // If @sendgrid/mail is not installed, just log
    if ((error as { code?: string }).code === 'MODULE_NOT_FOUND') {
      logger.warn(
        {
          to,
          subject,
          htmlLength: html.length,
        },
        'Email would be sent (SendGrid package not installed)'
      );
      return;
    }

    logger.error({ error, to, subject }, 'Failed to send email via SendGrid');
    throw error;
  }
}

/**
 * Send email immediately (synchronous)
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const locale = options.locale || Locale.JA;
  const html = renderTemplate(options.template, locale, options.data);

  await sendEmailViaProvider(options.to, options.subject, html);
}

/**
 * Queue email for async sending
 */
export async function queueEmail(options: SendEmailOptions): Promise<void> {
  const locale = options.locale || Locale.JA;
  const html = renderTemplate(options.template, locale, options.data);

  // In test mode, skip queueing and just log
  if (process.env.NODE_ENV === 'test') {
    logger.info(
      {
        to: options.to,
        subject: options.subject,
        template: options.template,
        htmlLength: html.length,
      },
      'Email would be queued (test mode)'
    );
    return;
  }

  try {
    await addEmailJob({
      to: options.to,
      subject: options.subject,
      html,
      locale,
      scheduledAt: options.scheduledAt,
    });

    logger.info({ to: options.to, template: options.template }, 'Email queued');
  } catch (error) {
    // If queue fails (e.g., Redis not available), just log
    logger.warn(
      {
        error,
        to: options.to,
        subject: options.subject,
        template: options.template,
      },
      'Failed to queue email, logging instead'
    );
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(
  to: string,
  userName: string,
  verificationToken: string,
  locale: Locale = Locale.JA
): Promise<void> {
  const verificationUrl = `${env.APP_URL || 'http://localhost:4000'}/api/v1/auth/verify-email?token=${verificationToken}`;

  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'メールアドレス確認 - Omotenashi Connect'
        : 'Verify Your Email - Omotenashi Connect',
    template: 'verify_email',
    locale,
    data: {
      user_name: userName,
      verification_url: verificationUrl,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  to: string,
  userName: string,
  resetToken: string,
  locale: Locale = Locale.JA
): Promise<void> {
  const resetUrl = `${env.APP_URL || 'http://localhost:4000'}/reset-password?token=${resetToken}`;

  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'パスワードリセット - Omotenashi Connect'
        : 'Password Reset - Omotenashi Connect',
    template: 'reset_password',
    locale,
    data: {
      user_name: userName,
      reset_url: resetUrl,
    },
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  to: string,
  locale: Locale,
  data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    bookingId: string;
    businessAddress?: string;
    businessPhone?: string;
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? '予約確認 - Omotenashi Connect'
        : 'Booking Confirmation - Omotenashi Connect',
    template: 'booking_confirmed',
    locale,
    data: {
      customer_name: data.customerName,
      business_name: data.businessName,
      service_name: data.serviceName,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      booking_id: data.bookingId,
      business_address: data.businessAddress || '',
      business_phone: data.businessPhone || '',
    },
  });
}

/**
 * Send booking reminder email
 */
export async function sendBookingReminder(
  to: string,
  locale: Locale,
  data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
    bookingId: string;
    reminderType: '24h' | '1h';
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? `予約リマインダー - ${data.bookingDate}`
        : `Booking Reminder - ${data.bookingDate}`,
    template: 'booking_reminder',
    locale,
    data: {
      customer_name: data.customerName,
      business_name: data.businessName,
      service_name: data.serviceName,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      booking_id: data.bookingId,
      reminder_type: data.reminderType,
    },
  });
}

/**
 * Send payment received email
 */
export async function sendPaymentReceived(
  to: string,
  locale: Locale,
  data: {
    customerName: string;
    businessName: string;
    amount: number;
    currency: string;
    paymentId: string;
    bookingId?: string;
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'お支払い確認 - Omotenashi Connect'
        : 'Payment Received - Omotenashi Connect',
    template: 'payment_received',
    locale,
    data: {
      customer_name: data.customerName,
      business_name: data.businessName,
      amount: data.amount.toLocaleString(locale === Locale.JA ? 'ja-JP' : 'en-US'),
      currency: data.currency,
      payment_id: data.paymentId,
      booking_id: data.bookingId || '',
    },
  });
}

/**
 * Send business creation confirmation
 */
export async function sendBusinessCreated(
  to: string,
  locale: Locale,
  data: {
    ownerName: string;
    businessName: string;
    businessSlug: string;
    businessStatus: string;
    dashboardUrl: string;
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'ビジネス登録完了 - Omotenashi Connect'
        : 'Business Registration Complete - Omotenashi Connect',
    template: 'business_created',
    locale,
    data: {
      owner_name: data.ownerName,
      business_name: data.businessName,
      business_slug: data.businessSlug,
      business_status: data.businessStatus,
      dashboard_url: data.dashboardUrl,
    },
  });
}

/**
 * Send business approval notification
 */
export async function sendBusinessApproved(
  to: string,
  locale: Locale,
  data: {
    ownerName: string;
    businessName: string;
    businessUrl: string;
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'ビジネス承認完了 - Omotenashi Connect'
        : 'Business Approved - Omotenashi Connect',
    template: 'business_approved',
    locale,
    data: {
      owner_name: data.ownerName,
      business_name: data.businessName,
      business_url: data.businessUrl,
    },
  });
}

/**
 * Send service created notification
 */
export async function sendServiceCreated(
  to: string,
  locale: Locale,
  data: {
    ownerName: string;
    businessName: string;
    serviceName: string;
    serviceId: string;
    dashboardUrl: string;
  }
): Promise<void> {
  await queueEmail({
    to,
    subject:
      locale === Locale.JA
        ? 'サービス作成完了 - Omotenashi Connect'
        : 'Service Created - Omotenashi Connect',
    template: 'service_created',
    locale,
    data: {
      owner_name: data.ownerName,
      business_name: data.businessName,
      service_name: data.serviceName,
      service_id: data.serviceId,
      dashboard_url: data.dashboardUrl,
    },
  });
}

