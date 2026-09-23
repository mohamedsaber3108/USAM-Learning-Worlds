import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BookOpen, Lightbulb, ArrowRight, SkipForward } from 'lucide-react'
import type { TeachingContent } from '@/features/missions/lib/teaching'

/**
 * The "Learn" beat of the Story → Learn → Practice → Reward loop.
 *
 * A child working alone must be *taught* a concept before being asked to
 * practise it, otherwise the mission is just a quiz. This card surfaces the
 * teachable material an activity already carries — context, key points, and a
 * worked example/solution — as a short, friendly explainer shown before the
 * first practice attempt.
 *
 * It is deliberately content-driven and self-hiding: the player only renders
 * it when `extractTeaching` (see ../lib/teaching) returns content, so we never
 * show an empty teaching card.
 */

interface LearnStepProps {
  title: string
  teaching: TeachingContent
  onReady: () => void
  onSkip: () => void
}

export function LearnStep({ title, teaching, onReady, onSkip }: LearnStepProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card border-2 border-primary-200/70"
    >
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
        <BookOpen className="w-4 h-4" strokeWidth={2} />
        {t('missionLearn.badge')}
      </div>

      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">{title}</h2>

      {teaching.context && (
        <p className="text-slate-700 text-lg leading-relaxed mb-5">{teaching.context}</p>
      )}

      {teaching.keyPoints && teaching.keyPoints.length > 0 && (
        <div className="mb-5 p-5 bg-surface-50 rounded-card">
          <h3 className="font-display font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary-500" strokeWidth={2} />
            {t('missionLearn.keyPointsTitle')}
          </h3>
          <ul className="space-y-2">
            {teaching.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {teaching.workedExample && (
        <div className="mb-5 p-5 bg-primary-50 rounded-card">
          <h3 className="font-display font-semibold text-slate-900 mb-2">
            {t('missionLearn.exampleTitle')}
          </h3>
          <p className="text-slate-700 whitespace-pre-wrap">{teaching.workedExample}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <SkipForward className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
          {t('missionLearn.skip')}
        </button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={onReady}
          className="btn btn-primary inline-flex items-center gap-1"
        >
          {t('missionLearn.ready')}
          <ArrowRight className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  )
}
