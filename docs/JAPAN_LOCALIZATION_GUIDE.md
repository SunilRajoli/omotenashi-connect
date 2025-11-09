# Japan Localization Guide

## Overview

Omotenashi Connect is designed for Japanese service businesses, with comprehensive localization support for Japanese (ja) and English (en) languages.

## Supported Locales

- **Japanese (ja)**: Primary language, default
- **English (en)**: Secondary language

## Language Detection

### Priority Order

1. **User Preference**: Stored in user profile or business settings
2. **Accept-Language Header**: Browser/client language preference
3. **IP-Based Detection**: Japan-based IPs default to Japanese
4. **Default Fallback**: Japanese

### Implementation

```typescript
// Language detection middleware
function getLocale(req: Request): Locale {
  // Check user preference
  if (req.user?.locale) {
    return req.user.locale;
  }
  
  // Check business settings
  if (req.business?.settings?.locale) {
    return req.business.settings.locale;
  }
  
  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage?.includes('en')) {
    return Locale.EN;
  }
  
  // Check IP location (Japan-based)
  if (isJapanIP(req.ip)) {
    return Locale.JA;
  }
  
  // Default to Japanese
  return Locale.JA;
}
```

## Database Fields

### Bilingual Fields

All user-facing content supports both Japanese and English:

**Business Fields:**
- `display_name_ja` / `display_name_en`
- `description_ja` / `description_en`
- `address_ja` / `address_en`

**Service Fields:**
- `name_ja` / `name_en`
- `description_ja` / `description_en`

**Resource Fields:**
- `name_ja` / `name_en`
- `description_ja` / `description_en`

**Review Fields:**
- `comment_ja` / `comment_en`
- `response_ja` / `response_en`

**Media Fields:**
- `caption_ja` / `caption_en`

### Single Language Fields

**User Fields:**
- `family_name`, `given_name` (Japanese names)
- `family_name_kana`, `given_name_kana` (Japanese kana)
- `display_name` (user's preferred display name)

## Message Localization

### Message Structure

**File**: `src/utils/messages.ts`

**Structure:**
```typescript
const messages = {
  'auth.unauthorized': {
    ja: '認証が必要です。',
    en: 'Authentication required.'
  },
  'booking.created': {
    ja: '予約を作成しました。',
    en: 'Booking created successfully.'
  },
  'payment.success': {
    ja: 'お支払いが完了しました。',
    en: 'Payment completed successfully.'
  }
};
```

### Using Messages

**In Controllers:**
```typescript
import { getMessage, getSuccessMessage } from '../utils/messages';
import { getLocale } from '../middleware/i18n';

export async function createBookingController(req: Request, res: Response) {
  const locale = getLocale(req);
  const message = getSuccessMessage('booking.created', locale);
  
  res.json({
    status: 'success',
    message: message, // Localized message
    data: { booking }
  });
}
```

## Email Templates

### Template Structure

**Location**: `src/templates/email/`

**Templates:**
- `verification-ja.html` / `verification-en.html`
- `password-reset-ja.html` / `password-reset-en.html`
- `booking-confirmation-ja.html` / `booking-confirmation-en.html`
- `booking-reminder-ja.html` / `booking-reminder-en.html`
- `payment-received-ja.html` / `payment-received-en.html`
- `business-created-ja.html` / `business-created-en.html`
- `business-approved-ja.html` / `business-approved-en.html`
- `service-created-ja.html` / `service-created-en.html`

### Template Rendering

**Implementation:**
```typescript
import { renderTemplate } from './email.service';

const html = await renderTemplate('booking-confirmation', locale, {
  customerName: customer.name,
  bookingDate: formatDate(booking.start_at, locale),
  serviceName: service.name_ja || service.name_en,
  businessName: business.display_name_ja || business.display_name_en
});
```

## Date and Time Formatting

### Japanese Format

**Date Format:**
- **Japanese**: `2024年12月25日`
- **English**: `December 25, 2024`

**Time Format:**
- **Japanese**: `14:00`
- **English**: `2:00 PM`

**DateTime Format:**
- **Japanese**: `2024年12月25日 14:00`
- **English**: `December 25, 2024 at 2:00 PM`

**Implementation:**
```typescript
import { formatDate, formatTime, formatDateTime } from '../utils/dates';

const date = formatDate(booking.start_at, 'ja'); // 2024年12月25日
const time = formatTime(booking.start_at, 'ja'); // 14:00
const datetime = formatDateTime(booking.start_at, 'ja'); // 2024年12月25日 14:00
```

### Timezone Handling

**Default Timezone:**
- **Japan**: `Asia/Tokyo` (JST)
- **User Timezone**: Stored in user profile

**Timezone Conversion:**
```typescript
import { convertToUserTimezone } from '../utils/dates';

const userTimezone = user.timezone || 'Asia/Tokyo';
const localTime = convertToUserTimezone(booking.start_at, userTimezone);
```

## Currency Formatting

### Japanese Yen (JPY)

**Format:**
- **Japanese**: `¥5,000`
- **English**: `¥5,000` or `JPY 5,000`

**Implementation:**
```typescript
function formatCurrency(amountCents: number, locale: Locale): string {
  const amount = amountCents / 100;
  
  if (locale === 'ja') {
    return `¥${amount.toLocaleString('ja-JP')}`;
  } else {
    return `¥${amount.toLocaleString('en-US')}`;
  }
}
```

## Address Formatting

### Japanese Address Format

**Format:**
```
〒123-4567
東京都渋谷区
道玄坂1-2-3
ビル名 101号室
```

**Fields:**
- `postal_code`: 〒123-4567
- `prefecture`: 東京都
- `city`: 渋谷区
- `address_line1`: 道玄坂1-2-3
- `address_line2`: ビル名 101号室

**Implementation:**
```typescript
import { formatJapaneseAddress } from '../utils/jp-address';

const address = formatJapaneseAddress({
  postal_code: '123-4567',
  prefecture: '東京都',
  city: '渋谷区',
  address_line1: '道玄坂1-2-3',
  address_line2: 'ビル名 101号室'
});
```

## Phone Number Formatting

### Japanese Phone Format

**Format:**
- **Domestic**: `090-1234-5678`
- **International**: `+81-90-1234-5678`

**Implementation:**
```typescript
function formatPhoneNumber(phone: string, locale: Locale): string {
  if (locale === 'ja') {
    // Japanese format: 090-1234-5678
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else {
    // International format: +81-90-1234-5678
    return `+81-${phone}`;
  }
}
```

## Japanese Business Etiquette

### Honorifics

**Customer Communications:**
- Use polite form (です/ます)
- Use appropriate honorifics (様, さん)
- Formal tone for business communications

**Email Templates:**
- Start with greeting (いつもお世話になっております)
- End with closing (よろしくお願いいたします)
- Use respectful language throughout

### Business Practices

**Booking Confirmations:**
- Include detailed information
- Use clear, polite language
- Provide cancellation policy in Japanese

**Payment Notifications:**
- Confirm payment amount clearly
- Use proper currency formatting
- Include payment method details

**Reminders:**
- Send 24 hours before booking
- Use polite reminder language
- Include cancellation information

## Best Practices

### Development

1. **Always Provide Both Languages**: When adding new content
2. **Use Message Keys**: Don't hardcode messages
3. **Test Both Languages**: Verify both ja and en
4. **Fallback to Japanese**: If translation missing

### Content Management

1. **Consistent Terminology**: Use consistent terms
2. **Cultural Sensitivity**: Consider cultural context
3. **Professional Translation**: For important content
4. **Review Translations**: Have native speakers review

### Testing

1. **Test Language Detection**: Verify detection logic
2. **Test Message Rendering**: Verify all messages
3. **Test Email Templates**: Verify both languages
4. **Test Date Formatting**: Verify date formats

## Common Japanese Phrases

### Email Templates

**Greetings:**
- `いつもお世話になっております` - "Thank you for your continued support"
- `お世話になっております` - "Thank you for your support"

**Closings:**
- `よろしくお願いいたします` - "Thank you in advance"
- `今後ともよろしくお願いいたします` - "Thank you for your continued support"

**Booking Confirmations:**
- `ご予約ありがとうございます` - "Thank you for your booking"
- `ご予約を承りました` - "We have received your booking"

**Payment Confirmations:**
- `お支払いが完了しました` - "Payment completed"
- `お支払いありがとうございます` - "Thank you for your payment"

## Localization Checklist

### For New Features

- [ ] Messages added for both languages
- [ ] Email templates created for both languages
- [ ] Database fields support both languages
- [ ] Date/time formatting supports both languages
- [ ] Currency formatting supports both languages
- [ ] API responses localized
- [ ] Tests cover both languages

---

**Last Updated**: 2024
**Version**: 1.0.0

