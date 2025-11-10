/**
 * LINE Configuration
 * LINE Messaging API and Login configuration
 */

import { Client, Config, middleware } from '@line/bot-sdk';
import { env } from './env';
import { logger } from '../utils/logger';

// LINE Messaging API Client
const channelAccessToken = env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = env.LINE_CHANNEL_SECRET || '';

export const lineConfig: Config = {
  channelAccessToken: channelAccessToken as string,
  channelSecret: channelSecret as string,
};

export const lineClient = channelAccessToken && channelSecret ? new Client(lineConfig as any) : null as unknown as Client;

// LINE Webhook Middleware
export const lineMiddleware: ReturnType<typeof middleware> | null = channelAccessToken && channelSecret ? middleware(lineConfig as any) : null;

// LINE Login Configuration
export const lineLoginConfig = {
  channelId: env.LINE_CHANNEL_ID || '',
  channelSecret: env.LINE_CHANNEL_SECRET || '',
  liffId: env.LINE_LIFF_ID || '',
  redirectUri: `${env.APP_URL}/api/v1/auth/line/callback`,
};

// Verify LINE configuration
if (env.NODE_ENV === 'production') {
  if (!env.LINE_CHANNEL_ID || !env.LINE_CHANNEL_SECRET || !env.LINE_CHANNEL_ACCESS_TOKEN) {
    logger.warn('LINE configuration is missing. LINE features will be disabled.');
  }
}

