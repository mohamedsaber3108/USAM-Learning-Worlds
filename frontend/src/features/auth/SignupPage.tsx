import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { useAuthStore } from '@/lib/auth/authStore'
import { roleHome } from '@/app/roleHome'
import { Button, Card, Input } from '@/components/ui'
import { AuthShell } from '@/features/public/PublicPage'
import { cn } from '@/lib/utils/cn'
import type { RegisterRequest } from '@/lib/api/types'

type Kind = 'LEARNER' | 'GUARDIAN'

/** Signup — rebuilt on design-system primitives. Real POST /api/auth/register
 * (public allowlist LEARNER|GUARDIAN); learner→onboarding, guardian→parent. */
export function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const status = useAuthStore((s) => s.status)

  const [kind, setKind] = useState<Kind>('LEARNER')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const payload: RegisterRequest =
      kind === 'LEARNER'
        ? { email, password, role: 'LEARNER', firstName, displayName: firstName }
        : { email, password, role: 'GUARDIAN', guardianFirstName: firstName }
    try {
      const user = await register(payload)
      // FIX (auth redirect audit): was hardcoded to '/parent' for any
      // non-learner signup. Public registration only ever allows
      // LEARNER|GUARDIAN (server-enforced allowlist), so this previously
      // happened to be correct by accident — but roleHome() is the single
      // source of truth for role->destination and must be used everywhere,
      // not re-derived ad hoc, so a future role never silently breaks here.
      navigate(user.role === 'LEARNER' ? '/onboarding' : roleHome(user.role), { replace: true })
    } catch (err) {
      const s = err instanceof AxiosError ? err.response?.status : undefined
      setError(s === 409 ? t('auth.emailTaken') : t('auth.createFailed'))
    }
  }

  return (
    <AuthShell>
      <Card>
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">
          USAM
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold">{t('auth.signupTitle')}</h1>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-ink-700">{t('auth.iAmA')}</p>
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            {(['LEARNER', 'GUARDIAN'] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  'rounded-control border px-3 py-2.5 text-sm font-medium transition-colors',
                  kind === k ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink-600 hover:bg-canvas-off',
                )}
              >
                {k === 'LEARNER' ? t('auth.learner') : t('auth.parent')}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <Input label={t('auth.firstName')} autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label={t('auth.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label={t('auth.password')}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            hint={t('auth.passwordHint')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" size="lg" loading={status === 'loading'} className="w-full">
            {t('auth.createAccount')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </Card>
    </AuthShell>
  )
}
