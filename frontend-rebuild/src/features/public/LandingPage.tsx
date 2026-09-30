import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

/**
 * Public ecosystem landing (foundation version). A real ecosystem
 * presentation — not a token-branch bounce (the legacy anti-pattern) and not a
 * generic SaaS template. Expanded in task 9.
 */
export function LandingPage() {
  const { t, i18n } = useTranslation()
  return (
    <div className="min-h-screen bg-canvas-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <span className="font-display text-xl font-extrabold text-brand-700">USAM</span>
        <nav className="ms-auto flex items-center gap-2">
          <button
            onClick={() => setLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            className="rounded-control px-3 py-2 text-sm text-ink-600 hover:bg-canvas-off"
          >
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </button>
          <Link to="/login" className="rounded-control px-3 py-2 text-sm font-medium text-ink-700 hover:bg-canvas-off">
            {t('public.logIn')}
          </Link>
          <Link to="/signup">
            <Button size="sm">{t('public.getStarted')}</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="animate-fade-in-up font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
          {t('public.heroTitle')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-600">{t('public.heroSubtitle')}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg">{t('public.getStarted')}</Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="secondary">
              {t('public.pricing')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
