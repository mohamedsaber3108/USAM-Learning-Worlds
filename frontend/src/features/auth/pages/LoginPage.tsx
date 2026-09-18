import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import apiClient from '@/lib/api/client'
import { getFriendlyErrorMessage } from '@/lib/utils/friendlyError'
import type { AuthResponse } from '@/types'
import usamLogo from '@/assets/usam-logo.png'
import { Button } from '@/components/ui/Button'
import { CharacterFace } from '@/features/characters/components/CharacterFace'

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ---- Brand panel (left on LTR / right on RTL) ---- */}
      <div className="relative lg:w-1/2 bg-brand-hero text-white overflow-hidden flex flex-col justify-between p-8 lg:p-12 min-h-[36vh] lg:min-h-screen">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-24 -start-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl animate-drift" />
        <div aria-hidden className="absolute bottom-0 -end-16 w-80 h-80 rounded-full bg-secondary-300/20 blur-3xl animate-drift" style={{ animationDelay: '3s' }} />

        <Link to="/" className="relative flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-control w-fit">
          <img src={usamLogo} alt="" aria-hidden className="h-9 w-auto brand-logo-invert" />
          <span className="font-display font-bold text-lg">{t('common.appName')}</span>
        </Link>

        <div className="relative hidden lg:flex flex-col items-center text-center gap-4 my-8">
          <div className="rounded-full bg-white/90 shadow-hero p-2 animate-bob">
            <CharacterFace characterId="Azouz" size={140} />
          </div>
          <p className="max-w-sm text-white/85 text-lg font-medium">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <p className="relative text-white/60 text-sm hidden lg:block">
          © {new Date().getFullYear()} USAM Learning Worlds
        </p>
      </div>

      {/* ---- Form panel ---- */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="display-lg">{t('auth.login.welcomeBack')}</h1>
            <p className="text-slate-500 mt-2">{t('auth.login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-control text-error-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.login.signUp')}
            </Link>
          </p>

          <div className="mt-8 p-4 bg-surface-50 border border-surface-200 rounded-control text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">{t('auth.login.demoAccountLabel')}</p>
            <p>{t('auth.login.demoEmailLabel')}</p>
            <p>{t('auth.login.demoPasswordLabel')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
