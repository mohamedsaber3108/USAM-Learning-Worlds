import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { worldsApi, masteryApi, type WorldRecord } from '@/lib/api/endpoints'
import { visualFor } from '@/features/learning/lib/worldVisual'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import { masteryLabel, type MasteryBand } from '@/lib/mastery/masteryLabels'

/**
 * WorldJourneyMap — the living-world home surface (experience-defect H5/§7/§8).
 *
 * Replaces WorldJourneyStrip's "row of small gradient rectangles" with the
 * learner's domains laid out as PLACES on a connecting journey path: a flowing
 * trail on desktop, a vertical snake on mobile. Each place is a generous
 * "portal" showing the world hue, its MENTOR (bespoke CharacterFace, not a
 * lucide icon), the child's MASTERY BAND as the place's state colour (visually
 * distinct from the XP ribbon — §19), mission progress, and lock state.
 *
 * Driven entirely by existing real engines — worldsApi.list() and
 * masteryApi.getByDomain() — so there is zero new data source and no mock. The
 * section self-hides while loading / on error / when the engine returns no
 * worlds, so Home never shows a broken or empty map.
 *
 * No new animation runtime: CSS/SVG + framer-motion only (§10, §8).
 */

// Domain slug -> mentor character. The 4 LOCKED primary domains map to their
// specialist mentors (characterVisuals). Fallback for any other world = Azouz.
const DOMAIN_MENTOR: Record<string, string> = {
  english: 'Luma',
  language: 'Luma',
  coding: 'Codey',
  technology: 'Codey',
  'ai-literacy': 'Nova',
  ai: 'Nova',
  entrepreneurship: 'Adam',
  creativity: 'Mira',
  arts: 'Mira',
}

function mentorFor(world: WorldRecord): string {
  const slug = world.domain?.slug || world.slug
  return DOMAIN_MENTOR[slug] ?? 'Azouz'
}

// Mastery band -> the colour that paints the portal's "state" ring. Keeps the
// band grammar from masteryLabels (new|learning|practicing|strong|mastered)
// but as a saturated ring hue, NOT the pale chip tint, so it reads at a glance.
const BAND_RING: Record<MasteryBand, string> = {
  new: 'ring-surface-300',
  learning: 'ring-sky-400',
  practicing: 'ring-primary-400',
  strong: 'ring-accent-400',
  mastered: 'ring-success-500',
}

interface DomainMastery {
  band: MasteryBand
  progress: number
}

/** Reduce the untyped /mastery/by-domain payload to a slug -> band/progress map. */
function buildDomainMastery(raw: unknown): Record<string, DomainMastery> {
  const out: Record<string, DomainMastery> = {}
  if (!Array.isArray(raw)) return out
  for (const row of raw as any[]) {
    const slug: string | undefined = row?.domain?.slug ?? row?.domainSlug ?? row?.slug
    if (!slug) continue
    // Prefer an explicit dominant/aggregate state if present; else derive from
    // the highest-progress label we can read. masteryLabel is the single
    // source of truth for the band mapping.
    const state: string | undefined = row?.dominantState ?? row?.state ?? row?.masteryState
    const label = masteryLabel(state)
    out[slug] = { band: label.band, progress: label.progress }
  }
  return out
}

export function WorldJourneyMap() {
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['worlds'],
    queryFn: () => worldsApi.list().then((r) => r.data as WorldRecord[]),
  })

  const { data: masteryByDomain } = useQuery({
    queryKey: ['mastery-by-domain'],
    queryFn: () => masteryApi.getByDomain().then((r) => r.data),
  })

  if (isLoading || isError || !Array.isArray(data) || data.length === 0) {
    return null
  }

  const worlds = [...data].sort((a, b) => a.order - b.order)
  const masteryMap = buildDomainMastery(masteryByDomain)

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mb-10"
      aria-labelledby="world-journey-heading"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow">{t('worldJourney.eyebrow', 'Your learning worlds')}</p>
          <h2
            id="world-journey-heading"
            className="font-display font-extrabold text-xl sm:text-2xl text-ink"
          >
            {t('worldJourney.title', 'Where will you go today?')}
          </h2>
        </div>
        <Link
          to="/worlds"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 shrink-0"
        >
          {t('worldJourney.viewMap', 'See the whole map')}
          <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
        </Link>
      </div>

      {/* The journey surface. A soft connecting trail sits behind the portals.
          Desktop: 4-up with the trail weaving through; mobile: vertical snake. */}
      <div className="relative">
        {/* Connecting trail — decorative, aria-hidden. A dashed path that reads
            as a route between places. Hidden on the smallest screens where the
            vertical stack already implies the path. */}
        <svg
          aria-hidden
          className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M6 30 Q 28 10, 50 32 T 94 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 2"
            className="text-primary-200"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {worlds.map((world, i) => {
            const v = visualFor(world.domain?.slug || world.slug)
            const mentor = mentorFor(world)
            const locked = !world.isUnlocked
            const slug = world.domain?.slug || world.slug
            const m = masteryMap[slug]
            const band: MasteryBand = m?.band ?? 'new'
            const ring = locked ? 'ring-surface-200' : BAND_RING[band]
            const label = masteryLabel(
              band === 'mastered' ? 'MASTERED'
                : band === 'strong' ? 'PROFICIENT'
                : band === 'practicing' ? 'PRACTICING'
                : band === 'learning' ? 'INTRODUCED'
                : 'NOT_STARTED'
            )

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 140, damping: 18 }}
                className={i % 2 === 1 ? 'sm:mt-10' : ''}
              >
                <Link
                  to={locked ? '/worlds' : `/worlds/${world.id}`}
                  aria-label={world.name}
                  className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50 rounded-blob"
                >
                  {/* The place/portal. Full-bleed world-hue gradient, the
                      mentor standing in it, mastery-band state ring. */}
                  <div
                    className={`relative overflow-hidden rounded-blob p-5 text-white shadow-lift ring-4 ${ring} transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-hero bg-gradient-to-br ${v.grad} ${
                      locked ? 'opacity-70 grayscale' : ''
                    }`}
                  >
                    <div aria-hidden className="dots-layer opacity-[0.18]" />

                    {/* Step/order badge */}
                    <div className="relative flex items-center justify-between">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/25 text-white text-xs font-extrabold">
                        {i + 1}
                      </span>
                      {locked ? (
                        <Lock className="w-5 h-5 text-white/90" strokeWidth={2.5} />
                      ) : band === 'mastered' ? (
                        <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                      ) : null}
                    </div>

                    {/* Mentor figure standing in the world */}
                    <div className="relative flex justify-center py-2">
                      <div className="rounded-full bg-white/15 p-2">
                        <CharacterFace
                          characterId={mentor}
                          size={76}
                          locked={locked}
                          animate={!locked}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <h3 className="font-display font-extrabold text-base leading-tight">
                        {world.name}
                      </h3>
                      <p className="text-xs text-white/85 mt-0.5">
                        {locked
                          ? t('worldJourney.locked', 'Keep going to unlock')
                          : t('worldJourney.missionCount', {
                              count: world.missionCount,
                              defaultValue: '{{count}} missions',
                            })}
                      </p>
                    </div>
                  </div>

                  {/* Below-portal: mastery band (distinct from XP) + mentor name. */}
                  {!locked && (
                    <div className="mt-2.5 flex items-center justify-between px-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-bold ${label.tint}`}
                      >
                        {t(label.labelKey, label.fallback)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {t('worldJourney.ledBy', 'with')} {mentor}
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
