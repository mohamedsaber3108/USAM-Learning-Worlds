import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { reflectionApi, type ReflectionPrompt } from '@/lib/api/endpoints'

/**
 * Metacognition Engine — Quick Reflection Check
 *
 * Shown right after a mission completes (see MissionCompletePage.tsx). A
 * minimal, real self-reflection flow: shows the short seeded prompt bank
 * ("How did that feel?" / "What was tricky?" / "What helped you get
 * through it?") one at a time with a 1-5 face-rating scale, and persists
 * each answer via POST /reflection/responses. Deliberately tiny in scope —
 * not a survey, just enough real metacognition signal to close the gap
 * flagged in USAM_KIDS_ENGINE_GAP_MATRIX.md (Metacognition Engine: Missing).
 */

const FACES = ['😖', '😕', '😐', '🙂', '😄']

export function ReflectionQuickCheck({ runId }: { runId: string }) {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['reflection-prompts'],
    queryFn: () => reflectionApi.getPrompts().then((res) => res.data),
  })

  const submitMutation = useMutation({
    mutationFn: (data: { promptId: string; rating: number }) =>
      reflectionApi.submitResponse({ missionRunId: runId, ...data }),
    onSuccess: () => {
      setSelected(null)
      if (prompts && index < prompts.length - 1) {
        setIndex(index + 1)
      } else {
        setDone(true)
      }
    },
  })

  if (isLoading || !prompts || prompts.length === 0) return null
  if (done) {
    return (
      <div className="mt-6 p-6 bg-secondary-50 rounded-card text-center">
        <p className="text-slate-700 font-medium">Thanks for reflecting! 🌟</p>
      </div>
    )
  }

  const current: ReflectionPrompt | undefined = prompts[index]
  if (!current) return null

  return (
    <div className="mt-6 p-6 bg-surface-50 rounded-card">
      <h3 className="font-display font-semibold text-slate-900 mb-4 text-center">
        {current.text}
      </h3>
      <div className="flex justify-center gap-3 mb-2">
        {FACES.map((face, i) => {
          const rating = i + 1
          return (
            <button
              key={rating}
              type="button"
              disabled={submitMutation.isPending}
              onClick={() => {
                setSelected(rating)
                submitMutation.mutate({ promptId: current.id, rating })
              }}
              className={`text-3xl w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                selected === rating ? 'scale-125 bg-primary-100' : 'hover:scale-110'
              }`}
              aria-label={`Rate ${rating} out of 5`}
            >
              {face}
            </button>
          )
        })}
      </div>
      <p className="text-center text-xs text-slate-400">
        {index + 1} of {prompts.length}
      </p>
    </div>
  )
}
