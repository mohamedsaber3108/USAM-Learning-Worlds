import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Lock, Play, Star } from 'lucide-react'
import type { WorldMission } from '@/lib/api/endpoints'
import { StatusPill } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

/**
 * WorldPath — an original CSS/SVG learning-path environment for a world's
 * missions, replacing the flat vertical card list. Renders the real
 * per-learner sequential missions (GET /worlds/:id, which already computes
 * COMPLETED/IN_PROGRESS/AVAILABLE/LOCKED per mission) as connected nodes on
 * a winding trail, so a child sees a journey with a clear current position,
 * what's next, and what's still locked — the directive's "world map / path
 * → current position → next → locked" model.
 *
 * No painted artwork: the environment is pure code — a gradient atmosphere
 * panel, an SVG connector trail whose completed segments fill with the
 * domain accent, and alternating-side circular nodes. Original geometry,
 * keyed to USAM's own real mission statuses. Accent tint comes from the
 * shared domainIdentity map (loosened Decision A); everything degrades to
 * the brand green default for unknown domains.
 *
 * `missionTypeLabel` and `statusLabel` are passed in (already translated by
 * the page) so this component stays presentation-only and test-friendly.
 */
export interface WorldPathProps {
  missions: WorldMission[]
  /** The mission the learner should do next (IN_PROGRESS, else first AVAILABLE). */
  nextMissionId?: string
  /** Accent classes from domainIdentity().chip, e.g. 'bg-sky-50 text-sky-700'. */
  accentChip: string
  /** Solid accent fill class for completed/active nodes, e.g. 'bg-sky-500'. */
  accentSolid: string
  statusLabel: (m: WorldMission) => string
  statusTone: (m: WorldMission) => 'success' | 'brand' | 'neutral'
  typeLabel: (m: WorldMission) => string | null
}

export function WorldPath({
  missions,
  nextMissionId,
  accentChip,
  accentSolid,
  statusLabel,
  statusTone,
  typeLabel,
}: WorldPathProps) {
  const { t } = useTranslation()

  return (
    <ol className="relative mt-4 space-y-3" aria-label={t('learner.worldMissions')}>
      {missions.map((m, i) => {
        const locked = m.status === 'LOCKED'
        const done = m.status === 'COMPLETED'
        const inProgress = m.status === 'IN_PROGRESS'
        const isNext = m.id === nextMissionId
        const isLast = i === missions.length - 1
        const typeText = typeLabel(m)

        // Node glyph: completed = check, locked = lock, active/next = play.
        const NodeIcon = done ? Check : locked ? Lock : Play

        const node = (
          <div
            className={cn(
              'relative flex items-center gap-4 rounded-card border p-4 transition-transform duration-fast',
              locked ? 'border-line bg-canvas-off opacity-70' : 'border-line bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-card',
              isNext && 'ring-2 ring-brand-400',
            )}
          >
            {/* Node marker + connector trail segment to the next node. */}
            <span className="relative flex flex-col items-center self-stretch">
              <span
                className={cn(
                  'z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  done || inProgress ? `${accentSolid} text-white` : locked ? 'bg-line text-ink-400' : accentChip,
                )}
                aria-hidden
              >
                <NodeIcon className="h-5 w-5" />
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-1/2 top-11 h-[calc(100%+0.75rem)] w-1 -translate-x-1/2 rounded-pill',
                    done ? accentSolid : 'bg-line',
                  )}
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate font-display font-bold text-ink-900">{m.title}</span>
                {isNext && (
                  <StatusPill tone="brand">
                    <Star className="h-3 w-3" aria-hidden /> {t('learner.missionNext')}
                  </StatusPill>
                )}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                {typeText && <span>{typeText}</span>}
                {m.estimatedMinutes ? <span>~{m.estimatedMinutes} min</span> : null}
                <StatusPill tone={statusTone(m)}>{statusLabel(m)}</StatusPill>
              </span>
              {locked && <span className="mt-1 block text-xs text-ink-400">{t('learner.missionLockedHint')}</span>}
            </span>
          </div>
        )

        return (
          <li key={m.id} className="relative">
            {locked ? node : <Link to={`/app/missions/${m.id}`}>{node}</Link>}
          </li>
        )
      })}
    </ol>
  )
}
