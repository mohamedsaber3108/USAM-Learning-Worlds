import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, ArrowLeft, Download, Trash2, Check, X, AlertTriangle } from 'lucide-react'
import { legalApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/CharacterState'

/**
 * Parent Privacy & Consent — the guardian-facing surface for the backend
 * Legal Compliance engine (COPPA/GDPR): per-purpose consent toggles, GDPR
 * data export, and data deletion. Safety-critical; was backend-only with no
 * frontend (traceability #43). All actions hit real endpoints — no fakes.
 *
 * Backend: GET /legal/consent/:learnerId → { purpose, granted, ... }[]
 *          POST /legal/consent { learnerId, purpose, granted }
 *          GET /legal/export/:learnerId → full data export JSON
 *          POST /legal/delete/:learnerId { reason }
 */

interface ConsentRow {
  purpose: string
  granted: boolean
  grantedAt?: string | null
  policyVersion?: string | null
}

// ConsentPurpose enum → human label + whether it's required (ESSENTIAL can't
// be revoked without ending the service; we show it read-on).
const PURPOSE_META: Record<string, { required?: boolean }> = {
  ESSENTIAL_SERVICE: { required: true },
  PERSONALIZATION: {},
  AI_PROCESSING: {},
  VOICE_PROCESSING: {},
  COMMUNITY: {},
  ANALYTICS: {},
}

export function ParentPrivacyPage() {
  const { learnerId = '' } = useParams()
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [exportUrl, setExportUrl] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['legal-consent', learnerId],
    queryFn: () => legalApi.getConsent(learnerId).then((r) => r.data as ConsentRow[]),
    enabled: !!learnerId,
  })

  const toggleConsent = useMutation({
    mutationFn: (vars: { purpose: string; granted: boolean }) =>
      legalApi.captureConsent({ learnerId, purpose: vars.purpose, granted: vars.granted }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['legal-consent', learnerId] }),
  })

  const exportData = useMutation({
    mutationFn: () => legalApi.exportData(learnerId).then((r) => r.data),
    onSuccess: (payload) => {
      // Turn the returned JSON into a downloadable blob URL.
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      setExportUrl(URL.createObjectURL(blob))
    },
  })

  const deleteData = useMutation({
    mutationFn: (reason: string) => legalApi.deleteData(learnerId, reason),
    onSuccess: () => {
      setConfirmDelete(false)
      qc.invalidateQueries({ queryKey: ['legal-consent', learnerId] })
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary-800 border-b border-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link to="/parents" className="inline-flex items-center gap-1.5 text-primary-200 hover:text-white text-sm font-medium mb-2">
            <ArrowLeft className="w-4 h-4 rtl:scale-x-[-1]" strokeWidth={2} />
            {t('privacy.back', 'Back to dashboard')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-200">
              <ShieldCheck className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{t('privacy.title', 'Privacy & Consent')}</h1>
              <p className="text-primary-200 text-sm mt-0.5">
                {t('privacy.subtitle', 'Manage what data we collect and your data rights.')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isError ? (
          <ErrorState
            character="Azouz"
            title={t('privacy.errorTitle', "Couldn't load consent settings")}
            message={t('privacy.errorMessage', 'Please try again.')}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState character="Azouz" message={t('privacy.loading', 'Loading privacy settings...')} />
        ) : (
          <>
            {/* Consent toggles */}
            <section className="parent-panel">
              <div className="parent-panel-header">
                <h2 className="font-semibold text-slate-800">{t('privacy.consentHeading', 'Data consent')}</h2>
              </div>
              <div>
                {(data ?? []).map((row) => {
                  const meta = PURPOSE_META[row.purpose] ?? {}
                  const busy = toggleConsent.isPending && toggleConsent.variables?.purpose === row.purpose
                  return (
                    <div key={row.purpose} className="parent-row">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">
                          {t(`privacy.purposes.${row.purpose}`, row.purpose.replace(/_/g, ' '))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t(`privacy.purposeDesc.${row.purpose}`, '')}
                        </p>
                      </div>
                      {meta.required ? (
                        <span className="parent-badge">{t('privacy.required', 'Required')}</span>
                      ) : (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.granted}
                          disabled={busy}
                          onClick={() => toggleConsent.mutate({ purpose: row.purpose, granted: !row.granted })}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                            row.granted ? 'bg-primary-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              row.granted ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'
                            } flex items-center justify-center`}
                          >
                            {row.granted ? (
                              <Check className="w-3 h-3 text-primary-600" strokeWidth={3} />
                            ) : (
                              <X className="w-3 h-3 text-slate-400" strokeWidth={3} />
                            )}
                          </span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Data rights (GDPR) */}
            <section className="parent-panel">
              <div className="parent-panel-header">
                <h2 className="font-semibold text-slate-800">{t('privacy.dataRights', 'Your data rights')}</h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Export */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">{t('privacy.exportTitle', 'Export your child’s data')}</p>
                    <p className="text-xs text-slate-500">{t('privacy.exportDesc', 'Download everything we store, in JSON.')}</p>
                  </div>
                  {exportUrl ? (
                    <a
                      href={exportUrl}
                      download={`usam-data-${learnerId}.json`}
                      className="parent-btn-primary"
                    >
                      <Download className="w-4 h-4" strokeWidth={2} />
                      {t('privacy.downloadReady', 'Download')}
                    </a>
                  ) : (
                    <button
                      onClick={() => exportData.mutate()}
                      disabled={exportData.isPending}
                      className="parent-btn-secondary"
                    >
                      <Download className="w-4 h-4" strokeWidth={2} />
                      {exportData.isPending ? t('privacy.preparing', 'Preparing...') : t('privacy.export', 'Prepare export')}
                    </button>
                  )}
                </div>

                {/* Delete */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{t('privacy.deleteTitle', 'Delete your child’s data')}</p>
                    <p className="text-xs text-slate-500">{t('privacy.deleteDesc', 'Permanently remove all stored learning data. This cannot be undone.')}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-error-50 text-error-700 text-sm font-medium hover:bg-error-100 border border-error-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    {t('privacy.delete', 'Delete data')}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Destructive-action confirmation modal — deletion is irreversible, so
          it requires an explicit second confirmation (never one-click). */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-lift max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-error-50 text-error-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-slate-900">{t('privacy.confirmTitle', 'Delete all data?')}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              {t('privacy.confirmBody', 'This permanently removes your child’s learning data and cannot be undone.')}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} className="parent-btn-secondary">
                {t('privacy.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => deleteData.mutate('guardian-requested')}
                disabled={deleteData.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-error-600 text-white text-sm font-medium hover:bg-error-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                {deleteData.isPending ? t('privacy.deleting', 'Deleting...') : t('privacy.confirmDelete', 'Yes, delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
