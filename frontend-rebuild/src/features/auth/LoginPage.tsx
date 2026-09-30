import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { roleHome } from '@/app/guards'
import { Button } from '@/components/ui/Button'

/** Real login against POST /api/auth/login. Foundation version; polished in
 * task 9 (full states, EN/AR, responsive, a11y pass). */
export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const status = useAuthStore((s) => s.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const user = await login({ email, password })
      navigate(roleHome(user.role), { replace: true })
    } catch {
      /* error surfaced from the store */
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-off px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8 shadow-card">
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">
          USAM
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">{t('auth.loginTitle')}</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-ink-900 focus-visible:border-brand-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-ink-900 focus-visible:border-brand-400"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-control bg-error-100 px-3 py-2 text-sm text-error-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={status === 'loading'} className="w-full">
            {t('auth.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-brand-600 hover:underline">
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
