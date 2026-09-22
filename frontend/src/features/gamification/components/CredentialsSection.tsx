import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BadgeCheck, ExternalLink, ShieldCheck } from 'lucide-react'
import { credentialsApi } from '@/lib/api/endpoints'

/**
 * Earned Credentials (Open Badges 3.0) — surfaces the backend Credentials
 * engine (GET /credentials/me), which issues real *verifiable* achievement
 * credentials but previously had NO frontend (traceability #36).
 *
 * These are distinct from in-app achievement badges: they're portable,
 * third-party-verifiable credentials. Each links to its public verification
 * document (GET /credentials/:uid) so a parent/school can independently check
 * it — the whole point of a verifiable credential.
 *
 * Backend shape (credentials.service.listForLearner): Credential[] with
 * { credentialUid, issuedAt, revokedAt, definition: { name, description,
 *   criteria, imageUrl } }.
 *
 * Self-hides when the learner has earned none yet (no empty shell).
 */

interface Credential {
  id: string
  credentialUid: string
  issuedAt: string
  revokedAt: string | null
  definition?: {
    name?: string
    description?: string
    criteria?: string
    imageUrl?: string | null
  }
}

// API base for building the public verification URL (same origin /api).
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api'

export function CredentialsSection() {
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['credentials-mine'],
    queryFn: () => credentialsApi.getMine().then((res) => res.data as Credential[]),
    retry: 1,
  })

  if (isError) return null
  if (!isLoading && (!Array.isArray(data) || data.length === 0)) return null

  const items = Array.isArray(data) ? data : []

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-10"
      aria-label={t('achievements.credentialsTitle', 'Verified credentials')}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldCheck className="w-5 h-5 text-primary-600" strokeWidth={2} />
        <h2 className="font-display font-extrabold text-ink text-xl">
          {t('achievements.credentialsTitle', 'Verified credentials')}
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        {t('achievements.credentialsSubtitle', 'Real, shareable badges you can verify anywhere.')}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-28" aria-hidden />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((cred, i) => {
            const name = cred.definition?.name || t('achievements.credentialFallback', 'Achievement credential')
            const verifyUrl = `${API_BASE}/credentials/${cred.credentialUid}`
            return (
              <motion.div
                key={cred.credentialUid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="card border-secondary-200 flex flex-col"
              >
                <div className="flex items-start gap-3.5">
                  {cred.definition?.imageUrl ? (
                    <img
                      src={cred.definition.imageUrl}
                      alt=""
                      aria-hidden
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="icon-chip bg-secondary-50 text-secondary-600 w-12 h-12 shrink-0">
                      <BadgeCheck className="w-6 h-6" strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-ink leading-snug">{name}</p>
                    {cred.definition?.description ? (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {cred.definition.description}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('achievements.credentialIssued', 'Issued')}{' '}
                      {new Date(cred.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-control self-start"
                >
                  {t('achievements.credentialVerify', 'Verify credential')}
                  <ExternalLink className="w-3.5 h-3.5 rtl:scale-x-[-1]" strokeWidth={2} />
                </a>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}
