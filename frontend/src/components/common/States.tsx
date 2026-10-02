import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

/** Shared, honest state components. No mock data anywhere — an empty result is
 * an EMPTY state, never fabricated content. */

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation()
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-16 text-ink-500">
      <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  )
}

export function EmptyState({ title, hint }: { title?: string; hint?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-lg text-ink-800">{title ?? t('states.empty')}</p>
      {hint && <p className="max-w-sm text-sm text-ink-500">{hint}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="font-display text-lg text-ink-800">{message ?? t('states.error')}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}

export function RestrictedState() {
  const { t } = useTranslation()
  return <EmptyState title={t('states.restricted')} />
}
