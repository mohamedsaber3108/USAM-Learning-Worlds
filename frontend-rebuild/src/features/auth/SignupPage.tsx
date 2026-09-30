import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { useAuthStore } from '@/lib/auth/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import type { RegisterRequest } from '@/lib/api/types'

type Kind = 'LEARNER' | 'GUARDIAN'

/** Real registration against POST /api/auth/register (public allowlist:
 * LEARNER | GUARDIAN only). Learner → onboarding; guardian → parent home. */
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
      navigate(user.role === 'LEARNER' ? '/onboarding' : '/parent', { replace: true })
    } catch (err) {
      const status = err instanceof AxiosError ? err.response?.status : undefined
      setError(status === 409 ? t('auth.emailTaken') : t('auth.createFailed'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-off px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-8 shadow-card">
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">
          USAM
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">{t('auth.signupTitle')}</h1>

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
                  kind === k
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-line text-ink-600 hover:bg-canvas-off',
                )}
              >
                {k === 'LEARNER' ? t('auth.learner') : t('auth.parent')}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <Field id="firstName" label={t('auth.firstName')} value={firstName} onChange={setFirstName} autoComplete="given-name" required />
          <Field id="email" label={t('auth.email')} type="email" value={email} onChange={setEmail} autoComplete="email" required />
          <Field
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            minLength={8}
            hint={t('auth.passwordHint')}
          />

          {error && (
            <p role="alert" className="rounded-control bg-error-100 px-3 py-2 text-sm text-error-700">
              {error}
            </p>
          )}

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
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  hint,
  ...rest
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  hint?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-ink-900 focus-visible:border-brand-400"
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}
