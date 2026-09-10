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

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registerSchema = z.object({
    email: z.string().email(t('auth.validation.invalidEmail')),
    password: z.string().min(8, t('auth.validation.passwordMinLength')),
    firstName: z.string().min(1, t('auth.validation.firstNameRequired')),
    displayName: z.string().min(1, t('auth.validation.displayNameRequired')),
  })

  type RegisterForm = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      setError('')

      // ageBand is intentionally NOT collected here — it's chosen in the
      // onboarding flow (AgeSelectPage) right after signup.
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        role: 'LEARNER',
        firstName: data.firstName,
        displayName: data.displayName,
      })

      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // First-time users always go through onboarding before the dashboard,
      // starting with language choice so the rest of the flow renders in
      // the right language/direction from the next screen onward.
      navigate('/onboarding/language')
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, t('auth.register.genericError')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="hero-glow -top-24 -right-16 w-72 h-72 animate-pulse-soft" aria-hidden="true" />
      <div
        className="hero-glow bottom-0 -left-16 w-80 h-80 bg-secondary-200/25 animate-pulse-soft"
        aria-hidden="true"
      />
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-soft-lg p-8 border border-surface-200/70">
          <div className="text-center mb-8">
            <img
              src={usamLogo}
              alt=""
              aria-hidden="true"
              className="h-11 w-auto mx-auto mb-5 animate-float-soft"
            />
            <h1 className="text-3xl font-bold text-ink mb-2">
              {t('auth.register.createAccount')}
            </h1>
            <p className="text-slate-500">{t('auth.register.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.firstNameLabel')}
              </label>
              <input
                {...register('firstName')}
                type="text"
                className="input"
                placeholder={t('auth.register.firstNamePlaceholder')}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.displayNameLabel')}
              </label>
              <input
                {...register('displayName')}
                type="text"
                className="input"
                placeholder={t('auth.register.displayNamePlaceholder')}
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.emailLabel')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder={t('auth.register.emailPlaceholder')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.register.passwordLabel')}
              </label>
              <input
                {...register('password')}
                type="password"
                className="input"
                placeholder={t('auth.register.passwordPlaceholder')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.register.haveAccount')}{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('auth.register.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
