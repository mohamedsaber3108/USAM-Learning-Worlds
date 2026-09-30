import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Shared public footer — identity + legal/safety links. */
export function PublicFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <span className="font-display text-lg font-extrabold text-brand-700">USAM</span>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-ink-500" aria-label="Footer">
          <Link to="/safety" className="hover:text-ink-900">
            {t('public.footerSafety')}
          </Link>
          <Link to="/legal" className="hover:text-ink-900">
            {t('public.footerPrivacy')}
          </Link>
          <Link to="/legal" className="hover:text-ink-900">
            {t('public.footerTerms')}
          </Link>
        </nav>
        <p className="text-xs text-ink-400">© {year} USAM. {t('public.footerRights')}</p>
      </div>
    </footer>
  )
}
