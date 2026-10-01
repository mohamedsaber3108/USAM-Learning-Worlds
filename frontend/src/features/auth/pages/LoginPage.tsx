import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { getFriendlyErrorMessage } from '@/lib/utils/friendlyError'
import type { AuthResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { CharacterStage } from '@/features/characters/components/CharacterStage'

/**
 * Login — rebuilt (not restyled) from the rejected 50/50 split-panel
 * template. Single centered world card on a warm canvas: Azouz present at
 * scale with a speech bubble, the form inline below him, no giant empty
 * brand panel, no demo credentials (removed from production — directive
 * P0). One column at every breakpoint; the "panel" IS the card, not a
 * separate half-screen rail.
 */
export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginSchema = z.object({
    email: z.string().email(t('auth.validation.invalidEmail')),
    password: z.string().min(8, t('auth.validation.passwordMinLength')),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      setError('')

      const response = await apiClient.post<AuthResponse>('/auth/login', data)

      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      navigate('/dashboard')
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, t('auth.login.genericError')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-soft relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute -top-24 -start-24 w-[28rem] h-[28rem] rounded-full bg-sky-300/30 blur-3xl animate-drift" />
      <div aria-hidden className="absolute bottom-0 -end-20 w-96 h-96 rounded-full bg-grape-300/25 blur-3xl animate-drift [animation-delay:3s]" />
      <div aria-hidden className="dots-layer opacity-40" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-xl w-fit mx-auto">
          <span dir="ltr" className="inline-flex items-center justify-center h-9 px-3 rounded-xl font-display font-extrabold text-lg tracking-tight bg-primary-600 text-white">USAM</span>
          <span className="font-display font-bold text-sm text-slate-500">{t('common.appName')}</span>
        </Link>

        <div className="bg-white rounded-blob shadow-hero border border-surface-200/70 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <CharacterStage characterId="Azouz" size={96} state="encouraging" bubbleSide="top" speech={t('auth.login.subtitle')} />
            <h1 className="display-lg mt-5">{t('auth.login.welcomeBack')}</h1>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-error-50 border border-error-200 rounded-control text-error-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.login.emailLabel')}
              </label>
              <input
                id="login-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input"
                placeholder={t('auth.login.emailPlaceholder')}
              />
              {errors.email && <p className="text-error-600 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.login.passwordLabel')}
              </label>
              <input
                id="login-password"
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder={t('auth.login.passwordPlaceholder')}
              />
              {errors.password && <p className="text-error-600 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" fullWidth loading={loading || isSubmitting}>
              {loading || isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
              {!(loading || isSubmitting) && <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600 text-sm">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>

        <p className="relative text-slate-400 text-xs text-center mt-6">
          © {new Date().getFullYear()} USAM Learning Worlds
        </p>
      </div>
    </div>
  )
}
