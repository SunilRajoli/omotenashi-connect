import { env } from './env.ts';

type MailInput = { to: string; subject: string; html?: string; text?: string };

export async function sendMail({ to, subject, html, text }: MailInput) {
  if (env.MAIL_PROVIDER === 'console') {
    // eslint-disable-next-line no-console
    console.log('[MAIL][console]', { to, subject, text, html });
    return;
  }
  // TODO: implement SES/Sendgrid providers
  // For now, fallback to console
  // eslint-disable-next-line no-console
  console.log('[MAIL][stub]', env.MAIL_PROVIDER, { to, subject });
}
