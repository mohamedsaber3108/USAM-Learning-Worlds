import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RotateCcw, ArrowRight } from 'lucide-react'
import { masteryApi } from '@/lib/api/endpoints'

/**
 * Home "review due" surface (phase task #4 item 6).
 *
 * Self-hiding card: shows only when the learner has spaced-review items due
 * (masteryApi.getReviewDue). Links to the Practice center. Child-friendly
 * framing — "keep these strong", never FSRS jargon.
 */
export function ReviewDueCard() {
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: ['review-due', 'home'],
    queryFn: () => masteryApi.getReviewDue().then((res) => res.data as unknown[]),
    retry: false,
  })

  const count = Array.isArray(data) ? data.length : 0
  if (count === 0) return null

  return (
    <Link
      to="/practice"
      className="card flex items-center justify-between gap-3 mb-10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      aria-label={t('home.reviewDueAria', 'Practice items due for review')}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="icon-chip bg-accent-50 text-accent-600 w-10 h-10 flex-shrink-0">
          <RotateCcw className="w-5 h-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">
            {t('home.reviewDueTitle', 'Time to keep {{count}} skill strong', { count })}
          </p>
          <p className="text-xs text-slate-500">
            {t('home.reviewDueSubtitle', 'A quick practice so you don’t forget')}
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 flex-shrink-0">
        {t('home.reviewDueCta', 'Practice')}
        <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
      </span>
    </Link>
  )
}
