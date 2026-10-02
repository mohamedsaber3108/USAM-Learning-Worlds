import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { masteryApi, flashcardsApi, type Flashcard } from '@/lib/api/endpoints'
import type { MasteryRecord } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, Tabs } from '@/components/ui'
import { REVIEW_FRAMING, masteryLabel } from '@/lib/labels/masteryLabels'

/**
 * Practice / review — "keep it strong". Two real tabs:
 *   1. Review — mastery items due (GET /mastery/review-due), unchanged.
 *   2. Flashcards — NEW (ledger 88 task 9): the backend's spaced-repetition
 *      flashcard engine (GET /flashcards/due, POST /flashcards/:id/review)
 *      had zero frontend representation despite being fully built
 *      (FSRS-scheduled). Added a real flip-card study flow.
 */
export function PracticePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'review' | 'flashcards'>('review')

  return (
    <div className="space-y-6">
      <PageHeader title={REVIEW_FRAMING.title} subtitle={REVIEW_FRAMING.subtitle} />
      <Tabs
        tabs={[
          { key: 'review', label: t('learner.practiceTabReview') },
          { key: 'flashcards', label: t('learner.practiceTabFlashcards') },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'review' ? <ReviewDueTab /> : <FlashcardStudyTab />}
    </div>
  )
}

function ReviewDueTab() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['review-due', 'practice'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as MasteryRecord[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const due = data ?? []
  if (due.length === 0) return <EmptyState title={REVIEW_FRAMING.emptyAllCaughtUp} />

  return (
    <div className="space-y-2">
      {due.map((r) => (
        <Card key={r.id} className="flex items-center justify-between">
          <span className="inline-flex min-w-0 items-center gap-3">
            <RotateCcw className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink-900">{r.competency?.name ?? r.competencyId}</span>
              {r.competency?.skill?.name && <span className="block text-xs text-ink-400">{r.competency.skill.name}</span>}
            </span>
          </span>
          <StatusPill tone="brand">{masteryLabel(r.state)}</StatusPill>
        </Card>
      ))}
    </div>
  )
}

function FlashcardStudyTab() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['flashcards-due'],
    queryFn: async () => (await flashcardsApi.getDue()).data,
  })

  const cards: Flashcard[] = data ?? []
  const current = cards[index]

  async function answer(remembered: boolean) {
    if (!current) return
    await flashcardsApi.review(current.id, remembered)
    setRevealed(false)
    if (index + 1 < cards.length) {
      setIndex((i) => i + 1)
    } else {
      await qc.invalidateQueries({ queryKey: ['flashcards-due'] })
      setIndex(0)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (cards.length === 0) return <EmptyState title={t('learner.flashcardsEmpty')} />
  if (!current) return <EmptyState title={t('learner.flashcardsDone')} />

  return (
    <div className="mx-auto max-w-md space-y-4">
      <p className="text-center text-xs font-medium text-ink-400">
        {t('learner.flashcardProgress', { current: index + 1, total: cards.length })}
      </p>
      <Card className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-display text-lg font-bold text-ink-900">{current.front}</p>
        {revealed && <p className="border-t border-line pt-4 text-ink-600">{current.back}</p>}
      </Card>
      {!revealed ? (
        <Button className="w-full" onClick={() => setRevealed(true)}>
          {t('learner.flashcardShowAnswer')}
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => void answer(false)}>
            {t('learner.flashcardForgot')}
          </Button>
          <Button onClick={() => void answer(true)}>{t('learner.flashcardRemembered')}</Button>
        </div>
      )}
    </div>
  )
}
