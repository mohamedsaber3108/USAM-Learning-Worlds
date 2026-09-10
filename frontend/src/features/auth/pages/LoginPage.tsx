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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="hero-glow -top-24 -left-16 w-72 h-72 animate-pulse-soft" aria-hidden="true" />
      <div
        className="hero-glow bottom-0 -right-16 w-80 h-80 bg-secondary-200/25 animate-pulse-soft"
        aria-hidden="true"
      />
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-soft-lg p-8 border border-surface-200/70">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={usamLogo}
              alt=""
              aria-hidden="true"
              className="h-11 w-auto mx-auto mb-5 animate-float-soft"
            />
            <h1 className="text-3xl font-bold text-ink mb-2">
              {t('auth.login.welcomeBack')}
            </h1>
            <p className="text-slate-500">{t('auth.login.subtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.login.emailLabel')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder={t('auth.login.emailPlaceholder')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.login.passwordLabel')}
              </label>
              <input
                {...register('password')}
                type="password"
                className="input"
                placeholder={t('auth.login.passwordPlaceholder')}
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
              {loading || isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur rounded-lg text-center text-sm text-gray-600">
          <p className="font-medium mb-2">{t('auth.login.demoAccountLabel')}</p>
          <p>{t('auth.login.demoEmailLabel')}</p>
          <p>{t('auth.login.demoPasswordLabel')}</p>
        </div>
      </div>
    </div>
  )
}
