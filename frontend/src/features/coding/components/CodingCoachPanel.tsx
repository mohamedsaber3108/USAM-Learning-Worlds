import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Bug, BookOpen, Loader2, CloudOff } from 'lucide-react'
import { codingCoachApi } from '@/lib/api/endpoints'
import { CharacterAvatar } from '@/features/characters/components/CharacterAvatar'

/**
 * "Ask the coach" — surfaces the backend Coding Coach engine (G-9) inside the
 * coding mission runner: a learner stuck on code can ask Codey to explain it or
 * help debug it, with the mission's current code as context.
 *
 * The coach is AI-backed (Bedrock). This component is deliberately DEFENSIVE:
 * if the model is unavailable (creds/quota/outage) the request errors and we
 * show a friendly "coach is resting" state — it never blocks or breaks the
 * mission. The learner can always keep coding and submitting without it.
 */

const COACH = 'Codey'

interface CodingCoachPanelProps {
  code: string
  language: string
}

export function CodingCoachPanel({ code, language }: CodingCoachPanelProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const explain = useMutation({
    mutationFn: () => codingCoachApi.explain({ code, language }).then((r) => r.data),
  })
  const debug = useMutation({
    mutationFn: () => codingCoachApi.debug({ code, language }).then((r) => r.data),
  })

  const busy = explain.isPending || debug.isPending
  const failed = explain.isError || debug.isError
  const explainData = explain.data
  const debugData = debug.data

  const hasCode = code.trim().length > 0

  return (
    <div className="mt-4 rounded-card border-2 border-surface-200/70 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 bg-surface-50 hover:bg-surface-100 transition-colors text-start"
      >
        {/* Codey's world hue (green) — a real Tailwind tint, not the raw hex
            from characterVisuals (which isn't a class and rendered no bg). */}
        <span className="icon-chip bg-success-50 text-success-600 w-9 h-9 shrink-0">
          <Sparkles className="w-4 h-4" strokeWidth={2} />
        </span>
        <span className="flex-1">
          <span className="block font-display font-semibold text-slate-900 text-sm">
            {t('codingCoach.title')}
          </span>
          <span className="block text-xs text-slate-500">{t('codingCoach.subtitle')}</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 pt-1"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => { debug.reset(); explain.mutate() }}
                disabled={busy || !hasCode}
                className="btn btn-outline text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <BookOpen className="w-4 h-4" strokeWidth={2} /> {t('codingCoach.explain')}
              </button>
              <button
                onClick={() => { explain.reset(); debug.mutate() }}
                disabled={busy || !hasCode}
                className="btn btn-outline text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Bug className="w-4 h-4" strokeWidth={2} /> {t('codingCoach.debug')}
              </button>
            </div>

            {!hasCode && (
              <p className="text-sm text-slate-500">{t('codingCoach.writeSomething')}</p>
            )}

            {busy && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                {t('codingCoach.thinking')}
              </div>
            )}

            {/* Graceful degradation: the coach is AI-backed and may be
                unavailable. Never break the mission — show a resting state. */}
            {failed && !busy && (
              <div className="flex items-start gap-2 p-3 rounded-card bg-surface-50 text-slate-600 text-sm">
                <CloudOff className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" strokeWidth={2} />
                <span>{t('codingCoach.unavailable')}</span>
              </div>
            )}

            {!busy && !failed && (explainData || debugData) && (
              <div className="flex items-start gap-3">
                <div className="shrink-0 hidden sm:block">
                  <CharacterAvatar name={COACH} size="md" />
                </div>
                <div className="flex-1 space-y-3 text-sm text-slate-700">
                  {debugData && (
                    <>
                      {debugData.diagnosis && <p>{debugData.diagnosis}</p>}
                      {debugData.suggestedFix && (
                        <div>
                          <p className="font-display font-semibold text-slate-900 mb-1">{t('codingCoach.suggestedFix')}</p>
                          <p>{debugData.suggestedFix}</p>
                        </div>
                      )}
                      {Array.isArray(debugData.learningPoints) && debugData.learningPoints.length > 0 && (
                        <ul className="space-y-1">
                          {debugData.learningPoints.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  {explainData && (
                    <>
                      {explainData.explanation && <p>{explainData.explanation}</p>}
                      {Array.isArray(explainData.analogies) && explainData.analogies.length > 0 && (
                        <ul className="space-y-1">
                          {explainData.analogies.map((a, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-secondary-500 shrink-0" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
