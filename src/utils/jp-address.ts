/**
 * Japan address utilities
 * Postal code validation, address formatting, prefecture handling
 */

/**
 * Validate Japanese postal code format (XXX-XXXX)
 */
export function isValidPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{3}-?\d{4}$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * Format postal code (add hyphen if missing)
 */
export function formatPostalCode(postalCode: string): string {
  if (!postalCode) return '';
  
  // Remove all non-digits
  const digits = postalCode.replace(/\D/g, '');
  
  if (digits.length !== 7) {
    throw new Error('Postal code must be 7 digits');
  }
  
  // Format as XXX-XXXX
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

/**
 * Normalize postal code (remove hyphen)
 */
export function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/-/g, '');
}

/**
 * Japan prefectures list
 */
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;

export type Prefecture = typeof PREFECTURES[number];

/**
 * Check if prefecture is valid
 */
export function isValidPrefecture(prefecture: string): boolean {
  return PREFECTURES.includes(prefecture as Prefecture);
}

/**
 * Format full address in Japanese format
 */
export interface AddressComponents {
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
}

export function formatAddressJapanese(components: AddressComponents): string {
  const parts: string[] = [];
  
  if (components.postal_code) {
    parts.push(`〒${formatPostalCode(components.postal_code)}`);
  }
  
  if (components.prefecture) {
    parts.push(components.prefecture);
  }
  
  if (components.city) {
    parts.push(components.city);
  }
  
  if (components.street) {
    parts.push(components.street);
  }
  
  if (components.building) {
    parts.push(components.building);
  }
  
  return parts.join('');
}

/**
 * Format full address in English format
 */
export function formatAddressEnglish(components: AddressComponents): string {
  const parts: string[] = [];
  
  if (components.building) {
    parts.push(components.building);
  }
  
  if (components.street) {
    parts.push(components.street);
  }
  
  if (components.city) {
    parts.push(components.city);
  }
  
  if (components.prefecture) {
    parts.push(components.prefecture);
  }
  
  if (components.postal_code) {
    parts.push(formatPostalCode(components.postal_code));
  }
  
  return parts.join(', ');
}

/**
 * Parse address string into components
 * Note: This is a basic parser, may need enhancement for complex addresses
 */
export function parseAddress(address: string): AddressComponents {
  const components: AddressComponents = {};
  
  // Extract postal code
  const postalMatch = address.match(/〒?(\d{3}-?\d{4})/);
  if (postalMatch) {
    components.postal_code = formatPostalCode(postalMatch[1]);
  }
  
  // Extract prefecture (look for known prefectures)
  for (const prefecture of PREFECTURES) {
    if (address.includes(prefecture)) {
      components.prefecture = prefecture;
      break;
    }
  }
  
  return components;
}

/**
 * Validate phone number format (Japanese)
 * Format: 0XX-XXXX-XXXX or 0XXXXXXXXX
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number (add hyphens)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 11) {
    throw new Error('Phone number must be 10-11 digits');
  }
  
  // Format based on length
  if (digits.length === 10) {
    // 0XX-XXXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else {
    // 0XX-XXXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
}

