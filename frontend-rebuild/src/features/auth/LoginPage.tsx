import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { roleHome } from '@/app/roleHome'
import { Button, Card, Input } from '@/components/ui'
import { AuthShell } from '@/features/public/PublicPage'

/** Login — rebuilt on design-system primitives. Real POST /api/auth/login. */
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
      /* error surfaced from store */
    }
  }

  return (
    <AuthShell>
      <Card>
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">
          USAM
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold">{t('auth.loginTitle')}</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
          />
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
      </Card>
    </AuthShell>
  )
}
