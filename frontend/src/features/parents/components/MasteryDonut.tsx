export interface MasteryDonutProps {
  proficient: number
  developing: number
  emerging: number
}

const SIZE = 96
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Real proportional donut for the proficient/developing/emerging split —
 * replaces the plain three-row text list with an at-a-glance visual so a
 * parent doesn't have to do the ratio math themselves. Segments use the
 * project's existing semantic hues (emerald=proficient, indigo=developing,
 * slate=emerging) — no new colors introduced.
 */
export function MasteryDonut({ proficient, developing, emerging }: MasteryDonutProps) {
  const total = proficient + developing + emerging
  const segments =
    total === 0
      ? []
      : [
          { value: proficient, className: 'stroke-emerald-500' },
          { value: developing, className: 'stroke-indigo-500' },
          { value: emerging, className: 'stroke-slate-300' },
        ]

  let offsetAcc = 0

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 flex-shrink-0">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-slate-100"
        />
        {segments.map((seg, i) => {
          if (seg.value === 0) return null
          const length = (seg.value / total) * CIRCUMFERENCE
          const dasharray = `${length} ${CIRCUMFERENCE - length}`
          const dashoffset = -offsetAcc
          offsetAcc += length
          return (
            <circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              className={seg.className}
              strokeLinecap="butt"
            />
          )
        })}
      </svg>

      <div className="space-y-1.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Proficient
          </span>
          <span className="text-xs font-semibold text-slate-800 tabular-nums">{proficient}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            Developing
          </span>
          <span className="text-xs font-semibold text-slate-800 tabular-nums">{developing}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            Emerging
          </span>
          <span className="text-xs font-semibold text-slate-800 tabular-nums">{emerging}</span>
        </div>
      </div>
    </div>
  )
}
