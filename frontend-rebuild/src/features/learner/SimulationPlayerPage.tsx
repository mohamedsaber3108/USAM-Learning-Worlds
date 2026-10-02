import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { simulationsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Button } from '@/components/ui'

/**
 * Simulation player — walks the real decision-tree (SimulationScenario ->
 * SimulationDecisionPoint nodes, keyed by nodeKey).
 *
 * NEW (2026-10-02, ledger 88 task 9): SimulationsPage was catalog-only with
 * no detail/play view despite the backend fully supporting branching
 * scenarios (`:slug` detail with embedded nodes + `:scenarioId/nodes/:nodeKey`
 * for traversal). The full node list ships with the scenario fetch, so this
 * walks it client-side rather than round-tripping per node.
 */
export function SimulationPlayerPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const { data: scenario, isLoading, isError, refetch } = useQuery({
    queryKey: ['simulation', slug],
    queryFn: async () => (await simulationsApi.getBySlug(slug)).data,
    enabled: Boolean(slug),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!scenario) return <EmptyState />

  const nodeByKey = new Map(scenario.nodes.map((n) => [n.nodeKey, n]))
  const startKey = scenario.nodes.find((n) => n.id === scenario.startNodeId)?.nodeKey ?? scenario.nodes[0]?.nodeKey
  const node = nodeByKey.get(currentKey ?? startKey ?? '')

  function choose(nextNode?: string) {
    if (!currentKey) setHistory([startKey ?? ''])
    if (nextNode) {
      setHistory((h) => [...h, nextNode])
      setCurrentKey(nextNode)
    }
  }

  function restart() {
    setCurrentKey(null)
    setHistory([])
  }

  if (!node) return <EmptyState />

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={scenario.title}
        action={
          <Link to="/app/simulations" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            {t('learner.simulationBackToList')}
          </Link>
        }
      />

      {/* Breadcrumb of visited nodes — gives a sense of the path taken. */}
      {history.length > 1 && (
        <div className="flex items-center gap-1.5" aria-hidden>
          {history.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 rounded-pill bg-brand-300" />
          ))}
        </div>
      )}

      <Card>
        <p className="font-display text-lg font-bold text-ink-900">{node.prompt}</p>

        {node.isEnding ? (
          <>
            {node.outcomeNote && (
              <div className="mt-4 rounded-control bg-canvas-off p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('learner.simulationOutcome')}</p>
                <p className="mt-1 text-sm text-ink-700">{node.outcomeNote}</p>
              </div>
            )}
            <Button className="mt-5" variant="secondary" onClick={restart}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t('learner.simulationRestart')}
            </Button>
          </>
        ) : (
          <div className="mt-5 space-y-2">
            {node.choiceOptions.map((choice, i) => (
              <Button
                key={i}
                variant="secondary"
                className="w-full justify-start text-start"
                onClick={() => choose(choice.nextNode)}
              >
                {choice.label}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
