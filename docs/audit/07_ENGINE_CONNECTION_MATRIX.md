# 07 — Engine Connection Matrix

**Baseline:** `origin/main @ 3a787c0`. The spec is explicit that engines must not be isolated modules. This traces the mandatory connections and flags broken/weak links.

## Mandatory chains (spec) vs reality

### Core learning loop
`Learner Profile → Knowledge Graph → Adaptive → Recommendation → Mission → Content → Assessment → Mastery → Review → Evidence → Next Recommendation`

| Link | State | Evidence |
|---|---|---|
| Profile → Adaptive | **CONNECTED** | `learner-context.service` feeds ZPD/recommendation |
| Adaptive → Recommendation | **CONNECTED** | `recommendation.service.getOrchestratedNextActivity` |
| Recommendation → Mission | **WEAK** | recommendation returns activities; mission linkage partial |
| Mission → Activity → Assessment | **CONNECTED** | MissionActivity + submitActivity evaluate |
| Assessment → Mastery → Evidence | **CONNECTED but leaky** | `recordEvidence` fires, but activity-not-tied-to-mission (BE-M2) lets off-mission evidence in |
| Mastery → Review | **WEAK** | naive scheduler, not FSRS |
| Evidence → Portfolio → Credential | **BROKEN/INCOMPLETE** | Evidence stops at mastery; no credential/Open Badges chain (USAM-PORT-002) |

### Character loop
`Character → Learner Context → Objective/Mission Context → AI → Voice → Safety → Memory → Gamification`

| Link | State | Evidence |
|---|---|---|
| Character → Learner Context | **CONNECTED** | `character.service` builds context |
| Character → AI | **CONNECTED** | `aiProvider.invoke` |
| Character → Safety | **CONNECTED (strong)** | bidirectional `evaluateSafety` |
| Character → Voice | **WEAK** | voice module exists but not orchestrated into character turns |
| Character → Memory | **PARTIAL** | state/interactions logged; no prompt-level memory window on standalone chat |
| Objective/Mission → which Character | **BROKEN (missing orchestrator)** | USAM-CHAR-003 — no context-driven character handoff |
| Reachability | **BROKEN** | `/api/api/characters` double prefix (API-1) makes the whole loop unreachable from FE |

### English loop
`English → Content → Assessment → Mastery → Review → Voice → Luma → Projects → Portfolio`

| Link | State | Evidence |
|---|---|---|
| English → Content | **WEAK** | AI-generated at request time; no curated corpus |
| English → Assessment → Mastery | **BROKEN** | English endpoints don't record Evidence/Mastery; controller↔service DTO mismatch (ENG-1) |
| English → Voice (pronunciation) | **PLACEHOLDER** | hardcoded 0.85 score (ENG-2) |
| English → Luma character | **WEAK** | Luma exists; English coach service is separate from character path |
| English → Projects/Portfolio | **MISSING** | no project-based English wiring |

### Coding loop
`Coding → Sandbox → Projects → Assessment → Mastery → Codey → Portfolio`

| Link | State | Evidence |
|---|---|---|
| Coding → Sandbox | **PARTIAL** | Pyodide/Sandpack; security unverified |
| Coding → Assessment/Mastery | **WEAK** | coding-sandbox not clearly recording Evidence |
| Coding → Safety | **BROKEN** | coding-coach path has NO moderation (SAFE-006) |
| Coding → Portfolio | **WEAK** | manual project creation |

### AI loop
`AI → Model Router → Cost → Retrieval → Safety → Evaluation → Observability → Auditability`

| Link | State | Evidence |
|---|---|---|
| AI → Model Router | **BROKEN** | router is dead code (USAM-AI-002) |
| AI → Cost | **PARTIAL** | AIUsageLog only on legacy path, no $ |
| AI → Retrieval | **PARTIAL** | full-text grounding, not vector |
| AI → Safety | **PARTIAL** | strong on character; absent on coach paths |
| AI → Evaluation | **PARTIAL** | heuristic harness |

### Parent loop
`Parent → Learner → Progress → Safety → Privacy → Approvals → Notifications`

| Link | State | Evidence |
|---|---|---|
| Parent → Learner/Progress | **CONNECTED** | parents.service dashboards |
| Parent ← Safety escalation | **CONNECTED** | `REFERRED_TO_GUARDIAN` → `PARENT_FLAG` notification |
| Parent → Approvals/Consent | **WEAK** | `Guardianship.consentedAt` + JSON controls; no structured approval flow |

### Analytics → everything
`LearningEvent` model + analytics module exist and receive many event types; but **not all engines emit consistently**, and product/learning/AI analytics are not separated (USAM-ANALYT-002). State: **PARTIAL**.

## Broken/weak-link summary (priority order)

1. **Character loop unreachable** — API-1 double prefix (P0 routing).
2. **English → Assessment/Mastery broken** — DTO mismatch + no evidence recording (P0/P1).
3. **Evidence → Portfolio → Credential incomplete** — the spec's differentiator chain stops early (P1).
4. **Coding/English → Safety broken** — unmoderated child AI (P0 safety).
5. **Objective → Character orchestration missing** (P1).
6. **AI → Model Router dead; Retrieval non-vector** (P1/P2).
7. **Mastery → Review weak** (naive scheduler) (P1).
8. **Analytics not fully fanned-in / not layered** (P2).
