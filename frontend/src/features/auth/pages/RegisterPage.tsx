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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ---- Brand panel ---- */}
      <div className="relative lg:w-1/2 bg-brand-hero text-white overflow-hidden flex flex-col justify-between p-8 lg:p-12 min-h-[30vh] lg:min-h-screen order-first">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div aria-hidden className="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-grape-400/20 blur-3xl animate-drift" />
        <div aria-hidden className="absolute bottom-0 -start-16 w-80 h-80 rounded-full bg-secondary-300/20 blur-3xl animate-drift" style={{ animationDelay: '3s' }} />

        <Link to="/" className="relative flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-control w-fit">
          <img src={usamLogo} alt="" aria-hidden className="h-9 w-auto brand-logo-invert" />
          <span className="font-display font-bold text-lg">{t('common.appName')}</span>
        </Link>

        <div className="relative hidden lg:flex flex-col items-center text-center gap-4 my-8">
          <div className="flex items-end gap-2">
            <div className="rounded-full bg-white/90 shadow-hero p-1.5 animate-bob"><CharacterFace characterId="Luma" size={92} /></div>
            <div className="rounded-full bg-white/90 shadow-hero p-2 animate-bob" style={{ animationDelay: '0.5s' }}><CharacterFace characterId="Azouz" size={120} /></div>
            <div className="rounded-full bg-white/90 shadow-hero p-1.5 animate-bob" style={{ animationDelay: '1s' }}><CharacterFace characterId="Codey" size={92} /></div>
          </div>
          <p className="max-w-sm text-white/85 text-lg font-medium">{t('auth.register.subtitle')}</p>
        </div>

        <p className="relative text-white/60 text-sm hidden lg:block">© {new Date().getFullYear()} USAM Learning Worlds</p>
      </div>

      {/* ---- Form panel ---- */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="display-lg">{t('auth.register.createAccount')}</h1>
            <p className="text-slate-500 mt-2">{t('auth.register.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-control text-error-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="reg-firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.register.firstNameLabel')}
              </label>
              <input id="reg-firstName" {...register('firstName')} type="text" autoComplete="given-name" className="input" placeholder={t('auth.register.firstNamePlaceholder')} />
              {errors.firstName && <p className="text-error-600 text-sm mt-1.5">{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-displayName" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.register.displayNameLabel')}
              </label>
              <input id="reg-displayName" {...register('displayName')} type="text" autoComplete="nickname" className="input" placeholder={t('auth.register.displayNamePlaceholder')} />
              {errors.displayName && <p className="text-error-600 text-sm mt-1.5">{errors.displayName.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.register.emailLabel')}
              </label>
              <input id="reg-email" {...register('email')} type="email" autoComplete="email" className="input" placeholder={t('auth.register.emailPlaceholder')} />
              {errors.email && <p className="text-error-600 text-sm mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">
                {t('auth.register.passwordLabel')}
              </label>
              <input id="reg-password" {...register('password')} type="password" autoComplete="new-password" className="input" placeholder={t('auth.register.passwordPlaceholder')} />
              {errors.password && <p className="text-error-600 text-sm mt-1.5">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" fullWidth loading={loading || isSubmitting}>
              {loading || isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
