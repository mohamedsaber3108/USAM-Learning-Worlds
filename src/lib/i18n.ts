/**
 * Phase 18: Internationalization Configuration
 *
 * i18next setup with:
 * - English and Arabic support
 * - RTL/LTR automatic switching
 * - Namespace organization
 * - Pluralization rules
 * - Fallback configuration
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import commonEn from "@/locales/en/common.json";
import navigationEn from "@/locales/en/navigation.json";
import learningEn from "@/locales/en/learning.json";
import curriculumEn from "@/locales/en/curriculum.json";
import projectsEn from "@/locales/en/projects.json";
import communityEn from "@/locales/en/community.json";
import parentEn from "@/locales/en/parent.json";
import errorsEn from "@/locales/en/errors.json";
import validationEn from "@/locales/en/validation.json";

import commonAr from "@/locales/ar/common.json";
import navigationAr from "@/locales/ar/navigation.json";
import learningAr from "@/locales/ar/learning.json";
import curriculumAr from "@/locales/ar/curriculum.json";
import projectsAr from "@/locales/ar/projects.json";
import communityAr from "@/locales/ar/community.json";
import parentAr from "@/locales/ar/parent.json";
import errorsAr from "@/locales/ar/errors.json";
import validationAr from "@/locales/ar/validation.json";

// Translation resources
const resources = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    learning: learningEn,
    curriculum: curriculumEn,
    projects: projectsEn,
    community: communityEn,
    parent: parentEn,
    errors: errorsEn,
    validation: validationEn,
  },
  ar: {
    common: commonAr,
    navigation: navigationAr,
    learning: learningAr,
    curriculum: curriculumAr,
    projects: projectsAr,
    community: communityAr,
    parent: parentAr,
    errors: errorsAr,
    validation: validationAr,
  },
} as const;

// Supported languages
export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Check if language is RTL
export function isRTL(language: string): boolean {
  return language === "ar";
}

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: Object.keys(resources.en),

    // Language detection
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React options
    react: {
      useSuspense: false, // Disable suspense for now
    },

    // Pluralization
    pluralSeparator: "_",
    contextSeparator: "_",

    // Debug in development
    debug: import.meta.env.DEV,
  });

// Update HTML attributes when language changes
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = isRTL(lng) ? "rtl" : "ltr";
});

// Set initial direction
document.documentElement.dir = isRTL(i18n.language) ? "rtl" : "ltr";

export default i18n;

/**
 * Usage:
 *
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 *
 * function MyComponent() {
 *   const { t } = useTranslation('common');
 *
 *   return (
 *     <div>
 *       <h1>{t('actions.save')}</h1>
 *       <p>{t('time.ago', { time: '5 minutes' })}</p>
 *       <p>{t('time.minutes', { count: 5 })}</p>
 *     </div>
 *   );
 * }
 * ```
 */
