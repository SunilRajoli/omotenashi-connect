# Japan Localization Guide

## Localization Features

### Supported Locales
- Japanese (ja)
- English (en)

### Implementation

1. **i18n Middleware**
   - Automatic locale detection
   - Header-based locale switching
   - Default fallback to Japanese

2. **Email Templates**
   - Localized email templates in `src/templates/email/`
   - Separate templates for each locale

3. **Date/Time Formatting**
   - Japanese calendar support
   - Timezone handling (JST)

4. **Address Handling**
   - Japanese address format validation
   - Prefecture/postal code support

## Best Practices

- Always provide Japanese translations
- Use proper honorifics in customer communications
- Follow Japanese business etiquette

