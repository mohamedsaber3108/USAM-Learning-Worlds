import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader, Card, Select, StatusPill } from '@/components/ui'

interface QuestionTemplate {
  id: string
  type: string
  objectiveId?: string | null
  prompt?: string
  stem?: string
}

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice' },
  { value: 'FILL_BLANK', label: 'Fill in the blank' },
  { value: 'TRUE_FALSE', label: 'True / false' },
  { value: 'SHORT_ANSWER', label: 'Short answer' },
]

/**
 * Question-template browser — real GET /questions/templates.
 *
 * NEW (ledger 88 batch 5): surfaced building the legacy URL redirect map —
 * legacy `/admin/question-templates` had a real backend consumer
 * (`questions.controller.ts`: list templates + generate an activity from
 * one) with zero `frontend-rebuild` representation. This pass closes the
 * read side (browse templates by type/objective) — template authoring
 * (create/edit a template's content) and the "generate activity from
 * template" action are a real content-authoring workflow out of scope for
 * this gap-closing batch; tracked, not fabricated as done.
 */
export function AdminQuestionTemplatesPage() {
  const [type, setType] = useState('')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-question-templates', type],
    queryFn: async () => (await adminApi.questionTemplates(type ? { type } : undefined)).data as QuestionTemplate[],
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Question Templates" />
      <div className="max-w-xs">
        <Select
          label="Filter by type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_OPTIONS}
        />
      </div>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {data.map((qt) => (
            <Card key={qt.id} className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">
                  {qt.prompt ?? qt.stem ?? qt.id}
                </span>
                {qt.objectiveId && <span className="text-xs text-ink-400">Objective: {qt.objectiveId}</span>}
              </span>
              <StatusPill tone="brand">{qt.type}</StatusPill>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
