import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Wand2, FileQuestion } from 'lucide-react'
import { questionsApi } from '@/lib/api/endpoints'

/**
 * Admin-only browse + generate UI for the Question Engine
 * (backend `QuestionTemplate` model / `questions.controller.ts` fully built
 * and seeded with real curriculum-linked templates, but had zero frontend
 * surface — same "backend built, frontend dead" bug class as feature-flags,
 * translations, coding-concepts, etc.
 *
 * Lets an admin browse reusable question templates (MCQ/FILL_BLANK/DRAG_DROP,
 * each tied to a real LearningObjective) and "Generate" one into a real
 * missions Activity via the existing generator endpoint — no parallel
 * delivery system, this composes the exact same Activity model everything
 * else uses.
 */
export function AdminQuestionTemplatesPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [missionId, setMissionId] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-question-templates', typeFilter],
    queryFn: () =>
      questionsApi.listTemplates(typeFilter ? { type: typeFilter } : undefined).then((r) => r.data),
  })

  const generateMutation = useMutation({
    mutationFn: (templateId: string) => {
      const mid = missionId[templateId]
      return questionsApi.generateActivity(
        mid ? { templateId, missionId: mid } : { templateId },
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-question-templates'] }),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <FileQuestion className="w-6 h-6 text-primary-500" /> Question Templates
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        Curriculum-linked reusable question definitions. Generate composes a real mission Activity from a
        template — it flows through the standard delivery/mastery pipeline.
      </p>

      <div className="flex gap-2 mb-4">
        {['', 'MCQ', 'FILL_BLANK', 'DRAG_DROP'].map((t) => (
          <button
            key={t || 'ALL'}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              typeFilter === t
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-slate-500 border-surface-200'
            }`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-slate-400">No question templates found.</p>
      )}

      <div className="space-y-3">
        {data?.map((tpl) => (
          <div key={tpl.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-primary-100 text-primary-600 rounded px-1.5 py-0.5">
                    {tpl.type}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">{tpl.difficulty}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">{tpl.stem}</p>
                {tpl.options && (
                  <p className="text-xs text-slate-400 mt-1">Options: {tpl.options.join(', ')}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <input
                  placeholder="mission id (optional)"
                  value={missionId[tpl.id] || ''}
                  onChange={(e) => setMissionId((m) => ({ ...m, [tpl.id]: e.target.value }))}
                  className="text-xs border border-surface-200 rounded px-2 py-1 w-40"
                />
                <button
                  onClick={() => generateMutation.mutate(tpl.id)}
                  disabled={generateMutation.isPending}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-success-500 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Generate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
