import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

/**
 * AI disclosure notice — a small, factual "this is AI, not a person" banner
 * shown wherever a learner talks to a companion or AI coach (companion chat,
 * English Coach conversation tab). Closes a real gap found in the owner's
 * Legal/Privacy audit: nothing in the product disclosed the AI nature of
 * these surfaces to the child using them, despite COPPA/GDPR-K good practice
 * (and the guardian consent panel already naming "AI tutoring & companions"
 * as a purpose) expecting that disclosure to exist at the point of use, not
 * just in a settings toggle.
 *
 * Deliberately factual and narrow — states only what is true of the real
 * implementation (AI-generated replies, child-safety moderation on every
 * message, no claim of 24/7 human monitoring of every message). Does NOT
 * state company/legal facts (entity name, DPO, jurisdiction) — those are
 * NEEDS_OWNER_CONFIGURATION/NEEDS_LAWYER_REVIEW and must not be fabricated.
 */
export function AiDisclosureNotice() {
  const { t } = useTranslation()
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-control border border-line bg-canvas-off px-3.5 py-2.5 text-xs text-ink-500"
    >
      <Bot className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      <p>{t('common.aiDisclosure')}</p>
    </div>
  )
}
