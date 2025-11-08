/**
 * Date and time utilities
 * Japan timezone (Asia/Tokyo) handling, formatting, validation
 * Note: For full date-fns support, install: npm install date-fns date-fns-tz
 */

// Japan timezone
export const JAPAN_TIMEZONE = 'Asia/Tokyo';

/**
 * Get current time in Japan timezone
 */
export function nowInJapan(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: JAPAN_TIMEZONE }));
}

/**
 * Convert UTC date to Japan timezone
 */
export function toJapanTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString('en-US', { timeZone: JAPAN_TIMEZONE }));
}

/**
 * Convert Japan timezone date to UTC
 */
export function fromJapanTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Get the offset between UTC and Japan timezone
  const japanOffset = 9 * 60; // Japan is UTC+9
  const utcTime = dateObj.getTime() - (japanOffset * 60 * 1000);
  return new Date(utcTime);
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'yyyy-MM-dd',
  locale: 'ja' | 'en' = 'ja'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date');
  }
  
  // Simple formatter (for full date-fns support, install date-fns)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return formatStr
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format date and time for display
 */
export function formatDateTime(
  date: Date | string,
  formatStr: string = 'yyyy-MM-dd HH:mm',
  locale: 'ja' | 'en' = 'ja'
): string {
  return formatDate(date, formatStr, locale);
}

/**
 * Format time only
 */
export function formatTime(
  date: Date | string,
  formatStr: string = 'HH:mm',
  locale: 'ja' | 'en' = 'ja'
): string {
  return formatDate(date, formatStr, locale);
}

/**
 * Format date in Japanese format (YYYY年MM月DD日)
 */
export function formatDateJapanese(date: Date | string): string {
  return formatDate(date, 'yyyy年MM月dd日', 'ja');
}

/**
 * Format date and time in Japanese format
 */
export function formatDateTimeJapanese(date: Date | string): string {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm', 'ja');
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return parsed;
}

/**
 * Add minutes to a date
 */
export function addMinutesToDate(date: Date | string, minutes: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getTime() + minutes * 60 * 1000);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Get start of day in Japan timezone
 */
export function startOfDayJapan(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const japanDate = toJapanTime(dateObj);
  japanDate.setHours(0, 0, 0, 0);
  return japanDate;
}

/**
 * Get end of day in Japan timezone
 */
export function endOfDayJapan(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const japanDate = toJapanTime(dateObj);
  japanDate.setHours(23, 59, 59, 999);
  return japanDate;
}

/**
 * Check if date is before another date
 */
export function isDateBefore(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() < d2.getTime();
}

/**
 * Check if date is after another date
 */
export function isDateAfter(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.getTime() > d2.getTime();
}

/**
 * Calculate difference in minutes between two dates
 */
export function minutesDifference(
  date1: Date | string,
  date2: Date | string
): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60));
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

/**
 * Get ISO string from date
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format date for database (YYYY-MM-DD)
 */
export function formatDateForDB(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd');
}

/**
 * Format time for database (HH:mm:ss)
 */
export function formatTimeForDB(date: Date | string): string {
  return formatDate(date, 'HH:mm:ss');
}

