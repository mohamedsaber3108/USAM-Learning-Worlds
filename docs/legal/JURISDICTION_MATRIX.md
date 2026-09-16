# Jurisdiction Matrix — Child Data Protection (audit T-P1-13)

This document maps the child-privacy rules USAM Learning Worlds must honor per
jurisdiction, and how each rule is implemented in code. It is the reference for
the `LegalComplianceService`, the `ConsentRecord` / `DataSubjectRequest` models,
and per-domain retention windows.

> This is an engineering compliance reference, not legal advice. Final launch
> in each jurisdiction requires sign-off from qualified counsel. The blocking
> items are flagged at the bottom.

## Supported/target jurisdictions

| Jurisdiction | Primary regulation | Child threshold | Verifiable parental consent required |
| --- | --- | --- | --- |
| United States | COPPA | Under 13 | Yes — a verifiable method |
| EU / EEA | GDPR + GDPR-K (Art. 8) | 13–16 (member-state specific) | Yes (parental authorization) |
| United Kingdom | UK GDPR + Age Appropriate Design Code | Under 13 for consent | Yes |
| Egypt | PDPL (Law 151/2020) | Minor (guardian consent) | Guardian consent |

Content was rephrased for compliance with licensing restrictions.

## Rule → implementation matrix

| Requirement | Where enforced |
| --- | --- |
| Verifiable parental consent before collecting a child's data | `ConsentRecord.verificationMethod` captured at `LegalComplianceService.captureConsent()`; `Guardianship.consentedAt` gates account activation |
| Consent must be specific/purpose-bound (not blanket) | `ConsentPurpose` enum (ESSENTIAL_SERVICE, PERSONALIZATION, AI_PROCESSING, VOICE_PROCESSING, COMMUNITY, ANALYTICS) — one record per purpose |
| Proof of what was consented to, and when | `ConsentRecord.policyVersion` + `grantedAt` + append-only history |
| Right to withdraw consent | `captureConsent(granted=false)` writes a revocation row with `revokedAt` |
| Right of access / data portability (GDPR Art. 15) | `LegalComplianceService.exportLearnerData()` → `DataSubjectRequest(type=EXPORT)` produces a full JSON export |
| Right to erasure (GDPR Art. 17) | `LegalComplianceService.deleteLearnerData()` → cascade-deletes learner + user; audited before deletion |
| Data minimization | `LearnerContextService` builds AI context from pedagogically-necessary fields only; display uses first name / chosen displayName, not legal PII |
| Retention limits | Per-domain `retentionDays` (AI memory 90d, other stores 180d) + subject-initiated deletion above |
| Audit trail of privacy actions | `AuditLogService.record()` on every consent/export/deletion |
| Jurisdiction-aware handling | `ConsentRecord.jurisdiction` recorded per consent; drives which policy text/version applies |

## Consent flow (implemented)

1. Guardian creates account and links a learner (`Guardianship`, status PENDING).
2. Guardian is shown the current privacy policy (version `X`) and grants
   purpose-specific consent → `POST /legal/consent` creates `ConsentRecord`
   rows and (via existing flow) activates the guardianship.
3. Effective consent state is read via `GET /legal/consent/:learnerId`
   (latest record per purpose; absent = not consented).
4. Guardian can revoke any purpose at any time (new record, `granted=false`).

## Data-subject rights flow (implemented)

- **Export**: `GET /legal/export/:learnerId` → aggregated JSON of the learner's
  data; request tracked in `DataSubjectRequest`.
- **Delete**: `POST /legal/delete/:learnerId` → cascade erasure of learner +
  backing user account; audited first.

Both are authorized against the caller's active guardianship over the learner.

## Remaining items requiring counsel (genuine blockers to per-jurisdiction launch)

These are **policy/legal decisions**, not engineering gaps — the mechanisms
above are built and tested, but the following inputs must come from counsel:

1. The exact **verifiable consent method(s)** acceptable per jurisdiction
   (e.g. credit-card verification vs signed form vs gov-ID) — the code records
   whichever method string is used but does not mandate a specific one.
2. The **canonical privacy-policy text and version string** per jurisdiction.
3. The **member-state child age thresholds** for EU consent (13–16 varies).
4. **Data-retention maximums** per jurisdiction (current defaults are
   engineering choices, not legally-blessed values).
5. Whether **export must be delivered via a specific secure channel** (the
   current export returns JSON to the authenticated guardian).
