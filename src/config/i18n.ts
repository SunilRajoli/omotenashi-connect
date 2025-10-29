import i18next from 'i18next';
import { env } from './env.ts';

export async function initI18n() {
  await i18next.init({
    lng: env.DEFAULT_LOCALE,
    fallbackLng: 'ja',
    resources: {
      ja: { translation: { ok: 'OK' } },
      en: { translation: { ok: 'OK' } }
    }
  });
  return i18next;
}
