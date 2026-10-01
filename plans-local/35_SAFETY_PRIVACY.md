# 35 — SAFETY & PRIVACY

> Non-negotiable, child-first from the ground up (directive §9/§31). Backend:
> `moderation`, `safety-escalations`, `safety-policies`, `legal` (consent/data
> requests), AI eval harness, prompt templates + retention policy, memory
> governance, audit. Legal jurisdiction specifics = lawyer-review (owner-gated).

Date: 2026-09-30

---

## 1. Child-safety guardrails (hard)

- Characters (esp. Azouz) NEVER encourage secrecy, dependency, isolation, or
  manipulation; never replace parents (23 §3). Enforced in prompt templates +
  moderation + AI eval.
- AI output moderated (`moderation.service`, `moderate`/`quarantined` endpoints);
  flagged content quarantined (`QuarantinedContent`), reviewable by moderators.
- No child-to-child risk: community/collaboration bounded + moderated.

## 2. Privacy / compliance (COPPA/GDPR)

- Consent (`ConsentRecord`), data subject rights export/delete
  (`DataSubjectRequest`) — `legal` module. Parent is controller for the child.
- Data retention policy (`20260903_add_prompt_templates_and_retention_policy`);
  AI memory governance (`20260904_add_ai_memory_governance_fields`) — purge of
  expired AI memory (`purge-expired-ai-memory.ts`).
- NOTE (CORRECTED 2026-10-01): the previously-flagged memory-governance
  "authz gap" was a FALSE ALARM. The backend `admin/memory-governance` getStats
  checks `user.role` is ADMIN/MODERATOR and throws ForbiddenException (same
  in-method pattern as FeatureFlagController); the frontend route is wrapped in
  `<AdminRoute>`. Secure on both layers — not withheld. (A later consistency
  refactor to RolesGuard+@Roles is optional, not a security fix.)

## 3. Moderation operations (moderator role)

Escalation triage (`SafetyEscalation`: assign/resolve), community moderation,
interventions. Moderator ≠ admin clone (task-oriented queue — 17/18).
`SafetyPolicy` configurable policies.

## 4. AI safety (defense in depth)

Prompt templates (controlled), AI eval harness (`AIEvalRun`/`AIEvalResult` —
regression-test AI behavior), moderation on every AI turn (text + voice),
age-appropriate content gating (AgeVariant), provenance/QA on content.

## 5. Platform safety

Audit log (`AdminAuditLog`), feature flags for safe rollout, experiments gated.
Rate limiting (prior `rate-limit-audit.md`) — verify configured (G5).

## 6. Owner-gated items (irreversible / legal)

- Legal jurisdiction matrix + final privacy copy = lawyer review (owner decision).
- Enabling real payment = owner approval (11 §6).
- Any production data migration touching consent/PII = owner approval.

## 7. Status

Rich safety/privacy backend EXISTS. Gaps to verify in G5: memory-governance authz
fix; rate-limit config; moderation queue frontend (mod surfaces are NEW in root
`src/`). Full WCAG + privacy legal review = documented external dependencies.
