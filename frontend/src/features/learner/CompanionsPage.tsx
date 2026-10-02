import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, LockedBadge } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'

interface Character {
  id: string
  name: string
  role: string
}

/**
 * Companions gallery — real GET /characters/unlocked. Each companion is a
 * present, state-driven figure (CharacterStage), not a generic avatar —
 * matches the character-presence standard established on Landing (ledger 88
 * task 6/9). Clicking a companion opens a real chat (CompanionChatPage),
 * closing the "gallery with no way to talk to anyone" gap found in the
 * reconciliation pass.
 *
 * FIX (2026-10-02): the previous version read `data` as a bare array and
 * fields (`description`, `unlocked`, `relationshipState`) that don't exist
 * on the Character model at all. The real backend returns
 * `{ characters: [{id,name,role,personality,avatarUrl}] }` from BOTH
 * `/characters` and `/characters/unlocked` — switched to the unlocked
 * endpoint (role-appropriate: only shows companions the learner has actually
 * reached) and to the real field set.
 */
export function CompanionsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['characters-unlocked'],
    queryFn: async () => (await charactersApi.unlocked()).data.characters as Character[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.companions')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Link key={c.id} to={`/app/companions/${c.id}`}>
              <Card className="flex flex-col items-center text-center transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
                <CharacterStage characterId={c.name} size={88} />
                <h2 className="mt-3 font-display font-bold text-ink-900">{c.name}</h2>
                <p className="mt-1 text-xs text-ink-500">{t(`learner.companionRole.${c.role}`, c.role)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** Rendered inline where a locked (not-yet-unlocked) companion needs to be
 * shown without exposing chat — e.g. a future "all companions" browse view. */
export function LockedCompanionCard({ name }: { name: string }) {
  return (
    <Card className="flex flex-col items-center text-center opacity-70">
      <CharacterStage characterId={name} size={88} animate={false} />
      <h2 className="mt-3 font-display font-bold text-ink-900">{name}</h2>
      <LockedBadge label="Locked" />
    </Card>
  )
}
