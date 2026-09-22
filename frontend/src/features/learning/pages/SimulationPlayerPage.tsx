import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2, RotateCcw, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { simulationsApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/CharacterState'

/**
 * SimulationPlayer — the interactive node-walking player for the backend
 * Simulation engine (GET /simulations/:slug returns the scenario WITH all
 * nodes). Completes the Simulations surface begun with SimulationsPage
 * (traceability #38). Walks the branching decision tree entirely client-side
 * from the included nodes (same approach as the Story reader), so there is no
 * per-choice round-trip.
 *
 * Node shape (SimulationDecisionPoint): { id, nodeKey, prompt, isEnding,
 *   outcomeNote, choiceOptions: JSON }. choiceOptions is untyped JSON; we read
 *   common field names defensively (label/text + nextNodeKey/next/nodeKey).
 */

interface SimChoice {
  label?: string
  text?: string
  nextNodeKey?: string
  next?: string
  nodeKey?: string
}

interface SimNode {
  id: string
  nodeKey: string
  prompt: string
  isEnding: boolean
  outcomeNote?: string | null
  choiceOptions?: SimChoice[] | null
}

interface SimScenario {
  id: string
  title: string
  slug: string
  description?: string | null
  startNodeId?: string | null
  nodes: SimNode[]
}

function choiceLabel(c: SimChoice): string {
  return c.label || c.text || '...'
}
function choiceNext(c: SimChoice): string | undefined {
  return c.nextNodeKey || c.next || c.nodeKey
}

export function SimulationPlayerPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['simulation', slug],
    queryFn: () => simulationsApi.getScenario(slug).then((r) => r.data as SimScenario),
    enabled: !!slug,
  })

  // Index nodes by nodeKey for O(1) walking. The start node is either the
  // scenario.startNodeId (matched by id) or the first node.
  const { nodesByKey, startKey } = useMemo(() => {
    const map: Record<string, SimNode> = {}
    let start: string | undefined
    for (const n of data?.nodes ?? []) {
      map[n.nodeKey] = n
      if (data?.startNodeId && n.id === data.startNodeId) start = n.nodeKey
    }
    if (!start && (data?.nodes?.length ?? 0) > 0) start = data!.nodes[0]!.nodeKey
    return { nodesByKey: map, startKey: start }
  }, [data])

  const [currentKey, setCurrentKey] = useState<string | undefined>(undefined)
  const [history, setHistory] = useState<string[]>([])

  const activeKey = currentKey ?? startKey
  const node = activeKey ? nodesByKey[activeKey] : undefined

  function choose(next?: string) {
    if (!next || !nodesByKey[next]) return
    setHistory((h) => [...h, activeKey!])
    setCurrentKey(next)
  }
  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]!
      setCurrentKey(prev)
      return h.slice(0, -1)
    })
  }
  function restart() {
    setHistory([])
    setCurrentKey(startKey)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-brand-hero relative overflow-hidden shadow-lift">
        <div aria-hidden className="dots-layer opacity-[0.15]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/simulations" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-2">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('simulations.backToList', 'All simulations')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="icon-chip bg-white/15 text-white w-11 h-11"><Gamepad2 className="w-5 h-5" strokeWidth={2} /></div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
              {data?.title ?? t('simulations.title', 'Simulations')}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isError ? (
          <ErrorState
            character="Codey"
            title={t('simulations.errorTitle', "Couldn't load simulations")}
            message={t('simulations.errorMessage', "No worries — let's try again.")}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Codey" message={t('simulations.loading', 'Setting up your scenario...')} />
        ) : node ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="card-playful"
            >
              <p className="font-display font-bold text-ink text-lg sm:text-xl leading-relaxed">
                {node.prompt}
              </p>

              {node.isEnding ? (
                <div className="mt-5">
                  <div className="flex items-start gap-2.5 p-4 rounded-blob bg-success-50 border border-success-200">
                    <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {node.outcomeNote || t('simulations.endingDefault', "You reached the end of this scenario. Nice thinking!")}
                    </p>
                  </div>
                  <button onClick={restart} className="btn btn-primary w-full mt-5">
                    <RotateCcw className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
                    {t('simulations.playAgain', 'Play again')}
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {(node.choiceOptions ?? []).map((choice, idx) => {
                    const next = choiceNext(choice)
                    const reachable = !!next && !!nodesByKey[next]
                    return (
                      <button
                        key={idx}
                        onClick={() => choose(next)}
                        disabled={!reachable}
                        className="w-full flex items-center gap-3 p-4 rounded-blob border-2 border-surface-200 hover:border-primary-300 hover:bg-primary-50/50 text-start transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                      >
                        <span className="icon-chip bg-primary-50 text-primary-600 w-8 h-8 shrink-0 text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-700">{choiceLabel(choice)}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 rtl:scale-x-[-1]" strokeWidth={2.5} />
                      </button>
                    )
                  })}
                </div>
              )}

              {history.length > 0 && (
                <button
                  onClick={goBack}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:scale-x-[-1]" strokeWidth={2} />
                  {t('simulations.goBack', 'Go back a step')}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <ErrorState
            character="Codey"
            title={t('simulations.emptyTitle', 'This scenario has no steps yet')}
            message={t('simulations.emptyMessage', 'Check back soon!')}
            onRetry={() => refetch()}
          />
        )}
      </main>
    </div>
  )
}
