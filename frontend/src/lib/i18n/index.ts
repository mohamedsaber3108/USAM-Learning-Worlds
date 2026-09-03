import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ar } from './locales/ar';

export type SupportedUiLanguage = 'en' | 'ar';

const STORAGE_KEY = 'usam.language';

export function isRTLLanguage(language: string): boolean {
  return language === 'ar' || language === 'ar-EG';
}

/**
 * Applies dir="rtl"/dir="ltr" and lang="<code>" on <html>. Called on init
 * and every time the language toggle fires — this is what makes RTL a real
 * layout mirror (Tailwind's rtl: variant + our manual overrides key off
 * this attribute) rather than just swapped text in an LTR shell.
 */
export function applyDocumentDirection(language: string) {
  const dir = isRTLLanguage(language) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
}

function readStoredLanguage(): SupportedUiLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

export function setLanguage(language: SupportedUiLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // localStorage unavailable (private mode etc.) — in-memory only, fine.
  }
  i18n.changeLanguage(language);
  applyDocumentDirection(language);
}

export function getStoredLanguage(): SupportedUiLanguage {
  return readStoredLanguage();
}

const initialLanguage = readStoredLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

// Apply direction immediately on module load so the very first paint is
// already correct (no LTR flash before React mounts).
applyDocumentDirection(initialLanguage);

export default i18n;
