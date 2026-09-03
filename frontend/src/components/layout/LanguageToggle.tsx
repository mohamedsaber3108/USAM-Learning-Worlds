import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { setLanguage, getStoredLanguage, type SupportedUiLanguage } from '@/lib/i18n'

/**
 * Simple EN/AR toggle, persisted in localStorage via setLanguage().
 * Lives in the AppShell "More" drawer per the localization-wave-1 scope.
 */
export function LanguageToggle() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState<SupportedUiLanguage>(getStoredLanguage())

  function pick(lang: SupportedUiLanguage) {
    if (lang === current) return
    setLanguage(lang)
    setCurrent(lang)
  }

  return (
    <div className="quick-action !items-start ltr:!text-left rtl:!text-right col-span-2">
      <div className="icon-chip bg-primary-50 text-primary-600">
        <Languages className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-700 text-sm mb-2">{t('more.language')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => pick('en')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
              current === 'en'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-surface-200'
            }`}
          >
            {t('language.english')}
          </button>
          <button
            type="button"
            onClick={() => pick('ar')}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
              current === 'ar'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-surface-200'
            }`}
          >
            {t('language.arabic')}
          </button>
        </div>
      </div>
    </div>
  )
}
