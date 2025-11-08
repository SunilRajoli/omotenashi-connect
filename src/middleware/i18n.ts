/**
 * Internationalization Middleware
 * Locale detection and language handling
 * Supports: Japanese (ja) and English (en)
 */

import { Request, Response, NextFunction } from 'express';
import { BusinessSettings } from '../models/businessSettings.model';
import { logger } from '../utils/logger';

/**
 * Locale detection middleware
 * Detects locale from:
 * 1. Accept-Language header
 * 2. Business settings (if business context exists)
 * 3. Query parameter ?locale=ja|en
 * 4. Default: 'ja' (Japanese)
 */
export function i18nMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    let locale: 'ja' | 'en' = 'ja'; // Default to Japanese
    
    // 1. Check query parameter
    const queryLocale = req.query.locale as string;
    if (queryLocale === 'ja' || queryLocale === 'en') {
      locale = queryLocale;
    }
    
    // 2. Check Accept-Language header
    if (!queryLocale) {
      const acceptLanguage = req.headers['accept-language'];
      if (acceptLanguage) {
        // Parse Accept-Language header
        const languages = acceptLanguage
          .split(',')
          .map((lang) => lang.split(';')[0].trim().toLowerCase());
        
        // Check for Japanese
        if (languages.some((lang) => lang.startsWith('ja'))) {
          locale = 'ja';
        }
        // Check for English
        else if (languages.some((lang) => lang.startsWith('en'))) {
          locale = 'en';
        }
      }
    }
    
    // 3. Check business settings (if business context exists)
    // This will be set after tenantGuard runs
    if (req.business) {
      // Business settings should be loaded by tenantGuard
      const businessSettings = (req.business as unknown as { settings?: BusinessSettings }).settings;
      
      if (businessSettings?.default_locale) {
        const businessLocale = businessSettings.default_locale as 'ja' | 'en';
        if (businessLocale === 'ja' || businessLocale === 'en') {
          locale = businessLocale;
        }
      }
    }
    
    // Attach locale to request
    req.locale = locale;
    
    // Set response header
    res.setHeader('Content-Language', locale);
    
    next();
  } catch (error) {
    logger.error({ error }, 'i18n middleware error');
    // Default to Japanese on error
    req.locale = 'ja';
    next();
  }
}

/**
 * Require specific locale
 */
export function requireLocale(requiredLocale: 'ja' | 'en') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.locale !== requiredLocale) {
      // Set locale to required locale
      req.locale = requiredLocale;
      res.setHeader('Content-Language', requiredLocale);
    }
    next();
  };
}

/**
 * Get locale from request
 */
export function getLocale(req: Request): 'ja' | 'en' {
  return req.locale || 'ja';
}

/**
 * Format message based on locale
 */
export function t(
  req: Request,
  jaMessage: string,
  enMessage: string
): string {
  const locale = getLocale(req);
  return locale === 'ja' ? jaMessage : enMessage;
}

