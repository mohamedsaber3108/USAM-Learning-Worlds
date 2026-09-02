import { motion } from 'framer-motion'
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Palette,
  Cpu,
  Music as MusicIcon,
  Dumbbell,
  HeartPulse,
  Globe2,
  Brain,
  Sparkles,
  Wrench,
  Code2,
  Lock,
  type LucideIcon,
} from 'lucide-react'

export interface WorldPathDomain {
  id: string
  name: string
  isUnlocked: boolean
  conceptCount: number
  masteredCount: number
}

interface WorldPathMapProps {
  domains: WorldPathDomain[]
  selectedDomainId?: string
  onSelectDomain?: (domainId: string) => void
}

/**
 * Maps a real domain name (from the `domains` table) to a sensible
 * lucide-react icon. Falls back to Sparkles for anything unrecognized
 * so new domains never render blank.
 */
function iconForDomain(name: string): LucideIcon {
  const key = name.trim().toLowerCase()
  const map: Record<string, LucideIcon> = {
    language: BookOpen,
    mathematics: Calculator,
    science: FlaskConical,
    arts: Palette,
    technology: Cpu,
    music: MusicIcon,
    'physical education': Dumbbell,
    'health & wellness': HeartPulse,
    health: HeartPulse,
    'social studies': Globe2,
    'critical thinking': Brain,
    creativity: Sparkles,
    engineering: Wrench,
    'coding sandbox demo': Code2,
  }
  return map[key] ?? Sparkles
}

/**
 * WorldPathMap renders the learner's domains as a connected path of nodes -
 * a genuine structural step up from a flat icon-tile grid, without
 * requiring illustrated fantasy-map art. Domains render in a single
 * scrollable row on wider screens and stack vertically on narrow/mobile
 * viewports, each node joined to the next by a visible connector line.
 *
 * Unlocked domains show their real name plus a masteredCount/conceptCount
 * progress readout; locked domains render grayed-out with a lock icon.
 * Nodes animate into view staggered along the path (not all at once).
 */
export function WorldPathMap({ domains, selectedDomainId, onSelectDomain }: WorldPathMapProps) {
  return (
    <div
      className="world-path-map w-full overflow-x-auto pb-4"
      role="list"
      aria-label="Domain learning path"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 min-w-max sm:min-w-0 px-2">
        {domains.map((domain, index) => {
          const Icon = iconForDomain(domain.name)
          const isLast = index === domains.length - 1
          const isSelected = selectedDomainId === domain.id
          const progressPct =
            domain.conceptCount > 0
              ? Math.round((domain.masteredCount / domain.conceptCount) * 100)
              : 0

          return (
            <div
              key={domain.id}
              className="flex flex-col sm:flex-row items-center"
              role="listitem"
            >
              <motion.button
                type="button"
                disabled={!domain.isUnlocked}
                onClick={() => domain.isUnlocked && onSelectDomain?.(domain.id)}
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.12,
                  ease: 'easeOut',
                }}
                whileHover={domain.isUnlocked ? { scale: 1.06 } : {}}
                whileTap={domain.isUnlocked ? { scale: 0.97 } : {}}
                className={`world-path-node relative flex flex-col items-center justify-center gap-1 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow-pop transition-colors ${
                  domain.isUnlocked
                    ? isSelected
                      ? 'bg-primary-600 border-primary-700 text-white'
                      : 'bg-white border-primary-400 text-primary-700 hover:border-primary-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={
                  domain.isUnlocked
                    ? `${domain.name}: ${domain.masteredCount} of ${domain.conceptCount} mastered`
                    : `${domain.name}: locked`
                }
                title={domain.isUnlocked ? domain.name : `${domain.name} (locked)`}
              >
                {domain.isUnlocked ? (
                  <Icon className="w-8 h-8" aria-hidden="true" />
                ) : (
                  <Lock className="w-7 h-7" aria-hidden="true" />
                )}
                <span className="text-xs font-semibold text-center px-2 leading-tight line-clamp-2">
                  {domain.isUnlocked ? domain.name : 'Locked'}
                </span>
                {domain.isUnlocked ? (
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-white/90' : 'text-gray-500'
                    }`}
                  >
                    {domain.masteredCount}/{domain.conceptCount} ({progressPct}%)
                  </span>
                ) : null}
              </motion.button>

              {!isLast && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.12 + 0.2,
                    ease: 'easeOut',
                  }}
                  className={`world-path-connector shrink-0 rounded-full ${
                    domain.isUnlocked && domains[index + 1]?.isUnlocked
                      ? 'bg-primary-400'
                      : 'bg-gray-300'
                  } sm:w-10 sm:h-1.5 w-1.5 h-10 my-1 sm:my-0 sm:mx-1`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorldPathMap
