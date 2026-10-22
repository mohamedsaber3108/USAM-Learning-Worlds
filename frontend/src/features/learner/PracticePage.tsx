import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Sparkles } from 'lucide-react'
import { masteryApi, flashcardsApi, charactersApi, adaptiveApi, type Flashcard, type InterleavedPracticeItem } from '@/lib/api/endpoints'
import type { MasteryRecord } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, Tabs } from '@/components/ui'
import { REVIEW_FRAMING, masteryLabel } from '@/lib/labels/masteryLabels'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { cn } from '@/lib/utils/cn'

/**
 * Practice / review — "keep it strong". Two real tabs:
 *   1. Review — mastery items due (GET /mastery/review-due), unchanged.
 *   2. Flashcards — NEW (ledger 88 task 9): the backend's spaced-repetition
 *      flashcard engine (GET /flashcards/due, POST /flashcards/:id/review)
 *      had zero frontend representation despite being fully built
 *      (FSRS-scheduled). Added a real flip-card study flow.
 *
 * Companion presence (owner directive): a real GET /characters/orchestrate
 * pick appears beside the header — practice is a core engagement surface
 * that previously had zero companion presence at all.
 */
export function PracticePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'review' | 'flashcards' | 'recommended'>('review')
  const companion = useQuery({
    queryKey: ['practice-companion'],
    queryFn: async () => (await charactersApi.orchestrate()).data,
    retry: false,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {companion.data?.character && <CharacterStage characterId={companion.data.character.name} size={56} />}
        <PageHeader title={REVIEW_FRAMING.title} subtitle={REVIEW_FRAMING.subtitle} />
      </div>
      <Tabs
        tabs={[
          { key: 'review', label: t('learner.practiceTabReview') },
          { key: 'flashcards', label: t('learner.practiceTabFlashcards') },
          { key: 'recommended', label: t('learner.practiceTabRecommended') },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'review' ? <ReviewDueTab /> : tab === 'flashcards' ? <FlashcardStudyTab /> : <RecommendedPracticeTab />}
    </div>
  )
}

const REASON_KEY: Record<InterleavedPracticeItem['reason'], string> = {
  REVIEW_DUE: 'learner.practiceReasonReviewDue',
  STRUGGLING_FOCUS: 'learner.practiceReasonStrugglingFocus',
}

/**
 * Recommended — real Interleaving Engine output (GET /adaptive/
 * interleaved-practice), mixing real review-due competencies with real
 * struggling-focus ones instead of blocking practice by a single skill.
 * Each item links into the real learner path for that competency's domain
 * (same `competencyId -> domainSlug` cross-reference approach as
 * ReviewDueTab's dead-end fix) rather than being an informational dead end.
 */
function RecommendedPracticeTab() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adaptive-interleaved-practice'],
    queryFn: async () => (await adaptiveApi.getInterleavedPractice()).data,
  })
  // Cross-reference for domain slug — the interleaving engine returns
  // competencyId/competencyName only, no domain info, but the real mastery
  // overview (already fetched elsewhere in the app) carries the same
  // competency -> domain.slug shape proven in ReviewDueTab.
  const overview = useQuery({
    queryKey: ['mastery-overview', 'practice-recommended'],
    queryFn: async () => (await masteryApi.getOverview()).data as MasteryRecord[],
    retry: false,
  })
  const slugByCompetency = new Map((overview.data ?? []).map((m) => [m.competencyId, m.competency?.skill?.domain?.slug]))

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  if (items.length === 0) return <EmptyState title={t('learner.practiceRecommendedEmpty')} />

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const slug = slugByCompetency.get(item.competencyId)
        const content = (
          <Card className={cn('flex items-center justify-between', slug && 'transition-transform duration-fast hover:-translate-y-0.5')}>
            <span className="inline-flex min-w-0 items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{item.competencyName}</span>
                {item.activityTitle && <span className="block text-xs text-ink-400">{item.activityTitle}</span>}
              </span>
            </span>
            <StatusPill tone="brand">{t(REASON_KEY[item.reason])}</StatusPill>
          </Card>
        )
        return slug ? (
          <Link key={`${item.competencyId}-${item.order}`} to={`/app/learn/${slug}`}>
            {content}
          </Link>
        ) : (
          <div key={`${item.competencyId}-${item.order}`}>{content}</div>
        )
      })}
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
      {due.map((r) => {
        const slug = r.competency?.skill?.domain?.slug
        const content = (
          <Card className={cn('flex items-center justify-between', slug && 'transition-transform duration-fast hover:-translate-y-0.5')}>
            <span className="inline-flex min-w-0 items-center gap-3">
              <RotateCcw className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{r.competency?.name ?? r.competencyId}</span>
                {r.competency?.skill?.name && <span className="block text-xs text-ink-400">{r.competency.skill.name}</span>}
              </span>
            </span>
            <StatusPill tone="brand">{masteryLabel(r.state)}</StatusPill>
          </Card>
        )
        // FIX (reverse-engineering/experience directive, 2026-10-07, §15/§33:
        // "review" must lead somewhere — a review-due item previously had no
        // action at all, just an informational row. Real GET /mastery/
        // review-due already includes competency.skill.domain.slug (same
        // shape as getOverview — confirmed by reading mastery.service.ts),
        // so each item can now link straight into that domain's real path
        // (DomainPathPage already picks the right next mission for a
        // started-but-not-mastered competency), closing the dead end.
        return slug ? (
          <Link key={r.id} to={`/app/learn/${slug}`}>
            {content}
          </Link>
        ) : (
          <div key={r.id}>{content}</div>
        )
      })}
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
