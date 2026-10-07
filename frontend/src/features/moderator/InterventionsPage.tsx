import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, useToast } from '@/components/ui'

interface Intervention {
  id: string
  learnerId?: string
  recommendation?: string
  status?: string
}

/**
 * Interventions queue — acknowledge/resolve. Real /admin/interventions
 * (@Roles ADMIN, MODERATOR). DS.
 *
 * FIX (reverse-engineering/experience directive, 2026-10-07, §44 "Moderator
 * is task-based: Queue -> Case -> Context -> Decision"): `GET
 * /admin/interventions/learner/:learnerId` is real, correctly role-gated,
 * and had zero frontend wrapper/caller — a moderator reviewing one
 * intervention had no "Context" step: no way to see whether this learner
 * has a pattern of interventions (matters for the escalate-vs-resolve
 * judgment call the directive explicitly names). Added an inline
 * expand-to-drill-in per card rather than a separate page/route, since the
 * directive's own standard is "optimize for speed, clarity" — a full page
 * navigation for a context lookup would slow the queue down, not speed it up.
 */
export function InterventionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => (await moderationApi.interventions()).data as Intervention[],
  })

  async function ack(id: string) {
    await moderationApi.ackIntervention(id)
    toast.show(t('mod.acknowledge'), 'success')
    await qc.invalidateQueries({ queryKey: ['interventions'] })
  }
  async function resolve(id: string) {
    await moderationApi.resolveIntervention(id)
    toast.show(t('mod.resolve'), 'success')
    await qc.invalidateQueries({ queryKey: ['interventions'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.interventions')} />
      {items.length === 0 ? (
        <EmptyState title={t('mod.nothingToReview')} />
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-900">{it.recommendation ?? 'Intervention'}</span>
                  {it.status && <StatusPill tone="neutral">{it.status}</StatusPill>}
                </span>
                <div className="flex gap-2">
                  {it.learnerId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpanded(expanded === it.id ? null : it.id)}
                    >
                      {expanded === it.id ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => ack(it.id)}>
                    {t('mod.acknowledge')}
                  </Button>
                  <Button size="sm" onClick={() => resolve(it.id)}>
                    {t('mod.resolve')}
                  </Button>
                </div>
              </div>
              {expanded === it.id && it.learnerId && <LearnerContext learnerId={it.learnerId} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function LearnerContext({ learnerId }: { learnerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['intervention-learner-context', learnerId],
    queryFn: async () => (await moderationApi.interventionsForLearner(learnerId)).data as Intervention[],
    retry: false,
  })
  if (isLoading) return <p className="mt-3 border-t border-line pt-3 text-sm text-ink-400">Loading context…</p>
  const history = data ?? []
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        This learner's intervention history ({history.length})
      </p>
      {history.length === 0 ? (
        <p className="mt-1 text-sm text-ink-500">No prior interventions on record.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span className="min-w-0 truncate text-ink-700">{h.recommendation ?? 'Intervention'}</span>
              {h.status && <StatusPill tone={h.status === 'RESOLVED' ? 'success' : 'neutral'}>{h.status}</StatusPill>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
