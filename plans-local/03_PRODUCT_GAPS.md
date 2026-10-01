# 03 — PRODUCT GAPS (what the locked product requires vs what exists)

> Gap register for the product-first reset. Merges the prior
> `docs/architecture/USAM_GAP_REGISTER.md` (GAP-001..037) and adds PRODUCT-scope
> gaps (PG-*) exposed by the locked scope in 01. Every row is grounded in 02.
> Status: MISSING · PARTIAL · WRONG (exists but contradicts locked scope) ·
> SCHEMA_ONLY · MOCK_ONLY · OK.

---

## 1. Product-definition gaps (PG) — highest priority for this reset

| ID | Gap | Current | Required (01) | Status | Gate |
|----|-----|---------|---------------|--------|------|
| PG-01 | Primary domains | 12 seeded school subjects; only Math has a real slice | Exactly 4: English, Coding, AI, Entrepreneurship | WRONG | G3 (08) |
| PG-02 | Entrepreneurship as primary domain | cross-curricular concept table + char role only; not a Domain | Full Domain→Skill→Competency vertical | MISSING | G3 (08/28) |
| PG-03 | AI Literacy as primary domain | `AILiteracyConcept` flat list, no controller, not in graph | Full domain vertical, wired to mastery | PARTIAL | G3 (08/27) |
| PG-04 | English as standalone-premium product | 14 CEFR strands seeded; delivery depth unclear | Full skill set (speaking/pronunciation/writing/conversation/stories/placement) | PARTIAL | G3/G4 (25) |
| PG-05 | Coding real execution | 18 concepts; Pyodide/Sandpack in frontend deps | Safe sandbox + project scaffolding wired to evidence | PARTIAL | G4 (26) |
| PG-06 | 15-character roster | **backend `seed-character-universe.ts` seeds ALL 15 locked names EXACTLY** (Azouz,Zein,Luma,Codey,Nova,Mira,Rami,Faris,Tala,Adam,Byte,Nour,Rex,Zara,Atlas); FRONTEND `src/data/characters.ts` has a DIFFERENT 10-name cast | reconcile FRONTEND to the seeded 15; wire frontend to backend | PARTIAL (frontend-only mismatch) | G4 (23) |
| PG-07 | Azouz as orchestrating main companion | GUIDE character + conversation lifecycle exists | Owns onboarding/orientation/guidance/handoffs + guardrails | PARTIAL | G4 (23) |
| PG-08 | Voice as core capability | `voice` module+controller EXIST | verify STT/TTS depth, provider-independence, EG-Arabic benchmark; wire to frontend | PARTIAL | G4 (24) |
| PG-09 | Packages/Bundles | Plan + Subscription + EntitlementsService EXIST; packaging via `Plan.features` JSON | decide explicit `Package` entity vs features-JSON; map 4 domains into bundles | PARTIAL | G3 (10) |
| PG-10 | Pricing architecture | 4 plans speced (47); configurable `priceCents` | finalize scenarios; owner sign-off before charging; real gateway (external) | PARTIAL | G3 (11) |
| PG-11 | Multi-factor adaptation | mastery-confidence only | age+ability+mastery+interests+history+objective | PARTIAL | G4 (31) |
| PG-12 | First-time child journey | signup→dashboard; onboarding route exists | Welcome→meet Azouz→identity→avatar→interests→diagnostic→first world→first mission→first success→next | PARTIAL | G3 (15) |
| PG-13 | Learning-session engine | recommendations exist; no session orchestration | Adaptive REVIEW→DISCOVERY→EXPLAIN→PRACTICE→INTERACT→CREATE→REFLECT | MISSING | G4 (30/31) |
| PG-14 | Diagnostic / placement assessment | none | Entry diagnostic to set starting level per domain | MISSING | G3/G4 (30) |
| PG-15 | Levels with educational meaning | `Progression.level` = XP int only | Stage defs: entry req, outcomes per domain, missions, mastery, completion, next-level | MISSING | G3 (09) |
| PG-16 | Evidence as first-class, multi-source | `Evidence` model exists | Evidence from practice/voice/writing/coding/projects/reflection → portfolio/credential | PARTIAL | G4 (30/33) |
| PG-17 | Portfolio / credentials | `Credential`+`CredentialDefinition`+module EXIST; portfolio = project list | wire credentials to evidence; richer portfolio surface | PARTIAL | G4 (33) |
| PG-18 | Mock-backed frontend | most `src/services/*` mocked | Real backend integration end-to-end | MOCK_ONLY | G5 |
| PG-19 | Content provenance/licensing classification | `ContentItem` has generatedBy/validatedBy | IMPLEMENTED/GENERATED/LICENSED/NEEDS-REVIEW/MISSING labels + pipeline | PARTIAL | G3 (12/13) |
| PG-20 | ONE app (no parallel trees) | root `src/` + `frontend/` (+ server legacy) | Single app; others deleted post-migration | WRONG | G5 (41) |

## 2. Prior engineering gaps (merged from USAM_GAP_REGISTER.md)

Carried forward (still valid). Key CRITICAL/HIGH:
- GAP-001 Learning graph prerequisites · GAP-002 age-aware delivery (SCHEMA_ONLY)
  · GAP-005 activity–mission linkage (now has link table — RE-VERIFY) · GAP-006
  English architecture · GAP-007 coding execution · GAP-008 content validation
  pipeline · GAP-009 character behavior engine · GAP-011 memory/conversation
  scopes · GAP-012 diagnostic assessment · GAP-013 project milestones/rubrics
  (models now exist — RE-VERIFY) · GAP-016 learning-event telemetry (model exists
  — RE-VERIFY) · GAP-017 misconception tracking · GAP-018 AI-literacy curriculum
  · GAP-019 entrepreneurship engine · GAP-023 voice · GAP-024 notifications ·
  GAP-027 portfolio-with-evidence · GAP-028 reward/inventory.
- Full table + file locations: `docs/architecture/USAM_GAP_REGISTER.md`. Each will
  be re-verified against current schema in Gate 3/4 (some have since been
  partially built — e.g. MissionActivity link table, LearningEvent, Rubric).

## 3. Auth / platform gaps

| ID | Gap | Status |
|----|-----|--------|
| PG-21 | Password reset / email verification | TO VERIFY (G4) |
| PG-22 | Refresh-token rotation/revocation model | TO VERIFY (G4) |
| PG-23 | Generic audit log | EXISTS (`AdminAuditLog` + `audit` module) — verify coverage |
| PG-24 | Payment provider integration | PARTIAL — abstraction exists; real gateway external |
| PG-25 | Notifications (in-app/push/parent) | EXISTS (`Notification` + module) — verify channels |

## 4. Resolution routing

- WRONG-scope items (PG-01, PG-02, PG-06, PG-20) resolved by REDEFINITION in
  Gate 3/4 + migration in Gate 5 — not by patching the wrong seed.
- The backend is far more complete than first audited (96 models). Most PG items
  are PARTIAL (exists, needs wiring/verification), NOT greenfield. The dominant
  real gap is the FRONTEND being mock-backed (PG-18) + wrong seed data + the
  tree decision (PG-20).
- PARTIAL items get a re-verify pass in Gate 3/4 before any "done" claim.
- No item is marked resolved without evidence in the 45 feature truth table.

> CORRECTION LOG: PG-08/09/10/17 and the auth/platform rows were originally
> marked MISSING/GREENFIELD based on an under-counted backend audit. Verified
> against schema.prisma (96 models) + `src/modules` (~47) they are PARTIAL/EXISTS.
> Recorded to avoid fake-gap as much as fake-completeness.
