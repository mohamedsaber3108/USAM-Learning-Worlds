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
import { CharacterFace } from '@/features/characters/components/CharacterFace'

/**
 * Register — rebuilt (not restyled) from the rejected 50/50 split-panel
 * template, same single-column world-card architecture as LoginPage.
 */
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
    <div className="min-h-screen bg-brand-soft relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute -top-24 -end-24 w-[28rem] h-[28rem] rounded-full bg-grape-300/25 blur-3xl animate-drift" />
      <div aria-hidden className="absolute bottom-0 -start-20 w-96 h-96 rounded-full bg-sky-300/25 blur-3xl animate-drift [animation-delay:3s]" />
      <div aria-hidden className="dots-layer opacity-40" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-xl w-fit mx-auto">
          <span dir="ltr" className="inline-flex items-center justify-center h-9 px-3 rounded-xl font-display font-extrabold text-lg tracking-tight bg-primary-600 text-white">USAM</span>
          <span className="font-display font-bold text-sm text-slate-500">{t('common.appName')}</span>
        </Link>

        <div className="bg-white rounded-blob shadow-hero border border-surface-200/70 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-end gap-1.5">
              <CharacterFace characterId="Luma" size={64} />
              <CharacterFace characterId="Azouz" size={88} state="encouraging" />
              <CharacterFace characterId="Codey" size={64} />
            </div>
            <h1 className="display-lg mt-4">{t('auth.register.createAccount')}</h1>
            <p className="text-slate-500 mt-1.5 text-sm max-w-xs">{t('auth.register.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-error-50 border border-error-200 rounded-control text-error-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {!(loading || isSubmitting) && <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600 text-sm">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>

        <p className="relative text-slate-400 text-xs text-center mt-6">© {new Date().getFullYear()} USAM Learning Worlds</p>
      </div>
    </div>
  )
}
