export interface MasteryDomainBarsProps {
  byDomain: Record<string, { total: number; proficient: number; avgConfidence: number }>
}

/**
 * Horizontal proportional bars for per-domain mastery — replaces the
 * previous plain "12/18 · avg 64%" text rows with an actual visual
 * comparison across domains, so a parent can scan relative strength at
 * a glance instead of reading numbers one at a time.
 */
export function MasteryDomainBars({ byDomain }: MasteryDomainBarsProps) {
  const entries = Object.entries(byDomain)
  if (entries.length === 0) return null

  return (
    <div className="px-4 py-3 border-t border-slate-100 space-y-2.5">
      <p className="parent-section-label">By domain</p>
      {entries.map(([domain, stats]) => {
        const pct = stats.total > 0 ? Math.round((stats.proficient / stats.total) * 100) : 0
        return (
          <div key={domain}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-medium text-slate-700">{domain}</span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {stats.proficient}/{stats.total} proficient · avg {stats.avgConfidence}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
