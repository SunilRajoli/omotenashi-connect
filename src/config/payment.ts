import { env } from './env';

// Shallow facade; actual provider SDKs used inside payment service
export const paymentConfig = {
  provider: env.PAY_PROVIDER, // 'payjp' | 'stripe'
  payjpSecret: env.PAYJP_SECRET,
  stripeSecret: env.STRIPE_SECRET,
  webhookRetryMax: env.WEBHOOK_RETRY_MAX
};
