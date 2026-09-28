import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Zap, Flame, Sparkles } from 'lucide-react'
import { CharacterFace } from '@/features/characters/components/CharacterFace'
import type { AgeAdaptationConfig } from '@/lib/hooks/useAgeAdaptation'

/**
 * LivingWorldHero — the emotional center of the rebuilt Home (Phase D).
 *
 * Replaces the old "welcome banner + separate continue-learning card +
 * stats grid" with ONE intentional living-world surface that answers, at a
 * glance: who greets me (companion), what do I do next (single clear action),
 * and where am I (level/XP/streak ribbon). It does NOT own data — every value
 * is passed in from DashboardPage's existing real queries, so there is zero
 * new data source and zero data loss.
 *
 * Age-adaptive: younger bands get a bigger companion + fewer ribbon stats and
 * a louder next-action; older bands get a denser ribbon.
 */
export interface LivingWorldHeroProps {
  displayName: string
  companion: string
  adapt: AgeAdaptationConfig
  greeting: string
  /** The single next action. */
  nextTo: string
  nextTitle: string
  nextKicker: string
  nextLabel: string
  /** Progress ribbon (all real, from gamification queries). */
  level: number
  totalXp: number
  streak: number
  /** Equipped title cosmetic, if any. */
  equippedTitle?: string | null
}

export function LivingWorldHero({
  displayName,
  companion,
  adapt,
  greeting,
  nextTo,
  nextTitle,
  nextKicker,
  nextLabel,
  level,
  totalXp,
  streak,
  equippedTitle,
}: LivingWorldHeroProps) {
  const { t } = useTranslation()
  const simple = adapt.density === 'simple'
  const companionSize = simple ? 104 : 84

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-blob bg-brand-hero text-white p-6 sm:p-8 mb-8 shadow-lift"
      aria-label={t('home.heroLabel', 'Your world')}
    >
      <div aria-hidden className="dots-layer opacity-[0.15]" />
      <div aria-hidden className="absolute -top-16 -end-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 -start-10 w-64 h-64 rounded-full bg-secondary-300/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Companion — the guide greeting the child into their world. */}
        <div className="shrink-0 flex items-center gap-4 sm:block">
          <div className="rounded-full bg-white/15 p-2 w-fit animate-bob">
            <CharacterFace characterId={companion} size={companionSize} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-white/80 text-sm mb-1">{greeting}</p>
          <h1
            className={`font-display font-extrabold tracking-tight flex items-center gap-2 flex-wrap ${
              simple ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {t('home.welcome', { name: displayName, defaultValue: 'Hi {{name}}!' })}
            {equippedTitle && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                {equippedTitle}
              </span>
            )}
          </h1>

          {/* Progress ribbon — real level/XP/streak, compact. Younger band
              hides the rank-y detail and keeps XP + streak only. */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-sm font-semibold">
              {t('home.levelChip', { level, defaultValue: 'Level {{level}}' })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-sm font-semibold">
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
              {totalXp.toLocaleString()} {t('home.xp', 'XP')}
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1 text-sm font-semibold">
                <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
                {t('home.streakChip', { count: streak, defaultValue: '{{count}}-day streak' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* The ONE next action — the single visible path into the world. */}
      <Link
        to={nextTo}
        className="relative mt-6 flex items-center gap-4 rounded-card bg-white/95 text-slate-900 p-4 group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 hover:bg-white transition-colors"
      >
        <div className="icon-chip bg-primary-600 text-white w-12 h-12 shrink-0 group-hover:scale-105 transition-transform">
          <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{nextKicker}</p>
          <p className="font-display font-bold text-lg truncate">{nextTitle}</p>
        </div>
        <span className="btn-hero shrink-0 hidden sm:inline-flex">
          {nextLabel} <ArrowRight className="w-5 h-5 rtl:scale-x-[-1]" strokeWidth={2.5} />
        </span>
        <ArrowRight className="w-6 h-6 text-primary-600 sm:hidden rtl:scale-x-[-1]" strokeWidth={2.5} />
      </Link>
    </motion.section>
  )
}
