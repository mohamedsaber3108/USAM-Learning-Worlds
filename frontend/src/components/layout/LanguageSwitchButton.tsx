import { useState } from 'react'
import { Languages } from 'lucide-react'
import { setLanguage, getStoredLanguage, type SupportedUiLanguage } from '@/lib/i18n'

/**
 * Compact EN⇄AR language switch for the app header — a single tap flips the
 * whole UI language + direction (via setLanguage -> applyDocumentDirection).
 * Gives Arabic learners a first-class, always-visible switch instead of it
 * being buried in the mobile "More" drawer. Shows the language you'd switch
 * TO, so the affordance is obvious.
 */
export function LanguageSwitchButton() {
  const [current, setCurrent] = useState<SupportedUiLanguage>(getStoredLanguage())
  const next: SupportedUiLanguage = current === 'ar' ? 'en' : 'ar'
  const nextLabel = next === 'ar' ? 'العربية' : 'EN'

  function toggle() {
    setLanguage(next)
    setCurrent(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
      className="btn btn-secondary shadow-none px-3"
      title={next === 'ar' ? 'العربية' : 'English'}
    >
      <Languages className="w-4 h-4" strokeWidth={2} />
      <span className="text-xs font-bold">{nextLabel}</span>
    </button>
  )
}
