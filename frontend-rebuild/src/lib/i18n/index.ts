import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { ar } from './locales/ar'

export type Language = 'en' | 'ar'
const LANG_KEY = 'usam.lang'
const RTL_LANGS: Language[] = ['ar']

export function isRtl(lang: string): boolean {
  return RTL_LANGS.includes(lang as Language)
}

/** Apply <html lang/dir> so RTL is a first-class document concern, not a patch. */
export function applyDocumentDirection(lang: Language) {
  const el = document.documentElement
  el.lang = lang
  el.dir = isRtl(lang) ? 'rtl' : 'ltr'
}

const stored = (localStorage.getItem(LANG_KEY) as Language | null) ?? 'en'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: stored,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

applyDocumentDirection(stored)

export function setLanguage(lang: Language) {
  localStorage.setItem(LANG_KEY, lang)
  void i18n.changeLanguage(lang)
  applyDocumentDirection(lang)
}

export default i18n
