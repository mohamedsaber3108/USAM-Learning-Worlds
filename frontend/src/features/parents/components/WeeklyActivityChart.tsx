import { useMemo } from 'react'

export interface WeeklyActivityChartProps {
  /** Raw evidence rows for the window — each has a date + success flag. */
  evidence: Array<{ date: string; success: boolean }>
  /** Number of days the window covers (matches parentsApi.getChildActivity days param). */
  days: number
}

/**
 * Small, real bar chart — no charting library in this project's
 * dependencies (checked package.json: no recharts/visx/d3/victory), so
 * this is a purpose-built inline SVG rather than reaching for decorative
 * CSS bars. Each day is a stacked bar: emerald segment for successful
 * practice attempts, a muted slate segment for unsuccessful ones — real
 * counts from the activity window, not placeholder data.
 */
export function WeeklyActivityChart({ evidence, days }: WeeklyActivityChartProps) {
  const buckets = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const list = Array.from({ length: days }).map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (days - 1 - i))
      return { date: d, success: 0, fail: 0 }
    })

    evidence.forEach((e) => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      const bucket = list.find((b) => b.date.getTime() === d.getTime())
      if (!bucket) return
      if (e.success) bucket.success += 1
      else bucket.fail += 1
    })

    return list
  }, [evidence, days])

  const max = Math.max(1, ...buckets.map((b) => b.success + b.fail))
  const chartHeight = 88
  const barWidth = 22
  const gap = 10
  const width = buckets.length * (barWidth + gap) - gap

  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between mb-3">
        <p className="parent-section-label mb-0">Practice activity</p>
        <p className="text-[11px] text-slate-400">
          {evidence.length} attempt{evidence.length === 1 ? '' : 's'} in {days} days
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${chartHeight + 20}`}
        width="100%"
        height={chartHeight + 20}
        role="img"
        aria-label={`Practice attempts over the last ${days} days`}
        preserveAspectRatio="xMinYMin meet"
      >
        {buckets.map((b, i) => {
          const total = b.success + b.fail
          const totalH = total === 0 ? 0 : Math.max(3, (total / max) * chartHeight)
          const successH = total === 0 ? 0 : (b.success / total) * totalH
          const failH = totalH - successH
          const x = i * (barWidth + gap)
          const y0 = chartHeight - totalH

          return (
            <g key={b.date.toISOString()}>
              {/* baseline track so zero-activity days still register as a shape, not empty */}
              <rect x={x} y={chartHeight - 3} width={barWidth} height={3} rx={1.5} className="fill-slate-100" />
              {failH > 0 && (
                <rect
                  x={x}
                  y={y0}
                  width={barWidth}
                  height={failH}
                  rx={3}
                  className="fill-slate-300"
                />
              )}
              {successH > 0 && (
                <rect
                  x={x}
                  y={y0 + failH}
                  width={barWidth}
                  height={successH}
                  rx={3}
                  className="fill-emerald-500"
                />
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                className="fill-slate-400"
                style={{ fontSize: '9px' }}
              >
                {b.date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex items-center gap-4 mt-1">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Correct
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
          Missed
        </span>
      </div>
    </div>
  )
}
