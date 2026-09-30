import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import type { ActivitySummary } from '@/lib/api/learning-types'

/**
 * Renders a non-coding activity and produces the exact `response` shape the
 * backend ActivityEvaluator expects:
 *   SELECT   → { selectedAnswers: string[] }
 *   MATCH    → { matches: [{left,right}] }
 *   SEQUENCE → { orderedItems: string[] }
 *   SOLVE    → { answer: string }
 *   EXPLAIN  → { explanation: string }
 *   CREATE   → { submission: string }
 * (CODE is handled by the coding sandbox panel, not here.)
 */
export function ActivityView({
  activity,
  disabled,
  onSubmit,
}: {
  activity: ActivitySummary
  disabled?: boolean
  onSubmit: (response: Record<string, unknown>) => void
}) {
  const { t } = useTranslation()
  const c = activity.content as Record<string, any>

  const [selected, setSelected] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>(() => [...((c.items as string[]) ?? [])])
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<Record<string, string>>({})

  const question = (c.question as string) ?? (c.problem as string) ?? (c.prompt as string) ?? activity.title

  function submit() {
    switch (activity.type) {
      case 'SELECT':
        onSubmit({ selectedAnswers: selected })
        break
      case 'SEQUENCE':
        onSubmit({ orderedItems: order })
        break
      case 'SOLVE':
        onSubmit({ answer: text })
        break
      case 'EXPLAIN':
        onSubmit({ explanation: text })
        break
      case 'CREATE':
        onSubmit({ submission: text })
        break
      case 'MATCH':
        onSubmit({ matches: Object.entries(matches).map(([left, right]) => ({ left, right })) })
        break
    }
  }

  function move(i: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const canSubmit =
    activity.type === 'SELECT'
      ? selected.length > 0
      : activity.type === 'MATCH'
        ? Object.keys(matches).length === ((c.pairs as unknown[])?.length ?? 0)
        : activity.type === 'SEQUENCE'
          ? true
          : text.trim().length > 0

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-soft">
      <p className="font-display text-lg font-bold text-ink-900">{question}</p>
      {c.context && <p className="mt-2 text-sm text-ink-500">{c.context as string}</p>}

      <div className="mt-5 space-y-2">
        {activity.type === 'SELECT' &&
          ((c.options as string[]) ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={selected.includes(opt)}
              onClick={() => setSelected((p) => (p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt]))}
              className={cn(
                'block w-full rounded-control border px-4 py-3 text-start transition-colors',
                selected.includes(opt) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line hover:bg-canvas-off',
              )}
            >
              {opt}
            </button>
          ))}

        {activity.type === 'SEQUENCE' &&
          order.map((item, i) => (
            <div key={item} className="flex items-center gap-2 rounded-control border border-line px-4 py-3">
              <span className="min-w-0 flex-1 truncate">{item}</span>
              <div className="flex gap-1">
                <button aria-label="Move up" onClick={() => move(i, -1)} className="rounded px-2 text-ink-500 hover:bg-canvas-off">↑</button>
                <button aria-label="Move down" onClick={() => move(i, 1)} className="rounded px-2 text-ink-500 hover:bg-canvas-off">↓</button>
              </div>
            </div>
          ))}

        {activity.type === 'MATCH' &&
          ((c.pairs as Array<{ left: string; right: string }>) ?? []).map((pair) => {
            const rights = ((c.pairs as Array<{ right: string }>) ?? []).map((p) => p.right)
            return (
              <div key={pair.left} className="flex items-center gap-3 rounded-control border border-line px-4 py-3">
                <span className="min-w-0 flex-1 truncate font-medium">{pair.left}</span>
                <select
                  aria-label={pair.left}
                  value={matches[pair.left] ?? ''}
                  onChange={(e) => setMatches((m) => ({ ...m, [pair.left]: e.target.value }))}
                  className="rounded-control border border-line px-3 py-2"
                >
                  <option value="">—</option>
                  {rights.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}

        {(activity.type === 'SOLVE' || activity.type === 'EXPLAIN' || activity.type === 'CREATE') && (
          <textarea
            aria-label={question}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={activity.type === 'SOLVE' ? 2 : 5}
            className="w-full rounded-control border border-line px-3 py-2 text-ink-900 focus-visible:border-brand-400"
          />
        )}
      </div>

      <Button className="mt-5" disabled={disabled || !canSubmit} onClick={submit}>
        {t('learner.submit')}
      </Button>
    </div>
  )
}
