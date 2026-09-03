import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MessageSquareText, Pencil, PowerOff, Save, X } from 'lucide-react'
import { promptTemplateApi, type PromptTemplateRecord } from '@/lib/api/endpoints'

/**
 * Admin Prompt Template editor — real frontend surface for the
 * generic-prompt-template half of the "AI Prompt/Policy Engine"
 * (backend `admin-prompt-template.controller.ts` /
 * `prompt-template.service.ts`). Versions every system prompt that
 * used to be a hardcoded string literal in character.service.ts /
 * moderation.service.ts / coding-coach.service.ts /
 * english-coach.service.ts. Sibling page to AdminSafetyPolicyPage
 * (which covers the SafetyPolicy half of the same inventory row) —
 * together they close the "AI Prompt/Policy Engine" gap end-to-end.
 *
 * Unlike SafetyPolicy (read-only, seed-script-authored), this engine
 * DOES have a real edit path: PUT bumps version + records a required
 * changelog entry (upsertTemplate never deletes history), and PATCH
 * .../deactivate soft-disables a row so its owning service falls back
 * to the inline default without losing the row.
 */
export function AdminPromptTemplatePage() {
  const queryClient = useQueryClient()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState('')
  const [draftChangelog, setDraftChangelog] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-prompt-templates'],
    queryFn: () => promptTemplateApi.list().then((r) => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { key: string; content: string; changelog: string }) =>
      promptTemplateApi.update(vars.key, { content: vars.content, changelog: vars.changelog }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompt-templates'] })
      setEditingKey(null)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (key: string) => promptTemplateApi.deactivate(key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-prompt-templates'] }),
  })

  const startEdit = (row: PromptTemplateRecord) => {
    setEditingKey(row.key)
    setDraftContent(row.content)
    setDraftChangelog('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <MessageSquareText className="w-6 h-6 text-primary-500" /> Prompt Templates
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Versioned, changelog-tracked system prompts consumed by character chat, content
        moderation, and the coding/English coaches. Every callsite falls back to a safe
        inline default if a row here is missing or deactivated — ADMIN access only.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load prompt templates (ADMIN access required).</p>
      )}

      {data && (
        <div className="space-y-3">
          {data.length === 0 && <p className="text-slate-400 text-sm">No prompt templates seeded yet.</p>}
          {data.map((row) => (
            <div key={row.key} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800 font-mono text-xs">
                  {row.key} — v{row.version}
                </span>
                <div className="flex items-center gap-2">
                  {row.isActive ? (
                    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-success-50 text-success-600">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-surface-100 text-slate-400">
                      DEACTIVATED (using inline fallback)
                    </span>
                  )}
                  <button
                    onClick={() => startEdit(row)}
                    className="text-xs inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {row.isActive && (
                    <button
                      onClick={() => deactivateMutation.mutate(row.key)}
                      className="text-xs inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                    >
                      <PowerOff className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  )}
                </div>
              </div>

              {row.changelog && (
                <p className="text-xs text-slate-400 mb-1">Latest changelog: {row.changelog}</p>
              )}

              {editingKey === row.key ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    rows={8}
                    className="w-full text-xs font-mono border border-surface-200 rounded-lg p-2"
                  />
                  <input
                    value={draftChangelog}
                    onChange={(e) => setDraftChangelog(e.target.value)}
                    placeholder="Required changelog note describing this edit..."
                    className="w-full text-xs border border-surface-200 rounded-lg p-2"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={!draftChangelog.trim() || updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({ key: row.key, content: draftContent, changelog: draftChangelog })
                      }
                      className="text-xs inline-flex items-center gap-1 bg-primary-500 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> Save (v{row.version + 1})
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="text-xs inline-flex items-center gap-1 border border-surface-200 rounded-lg px-3 py-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="text-xs text-slate-500 whitespace-pre-wrap bg-surface-50 rounded-lg p-2 mt-1 max-h-32 overflow-y-auto">
                  {row.content}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
