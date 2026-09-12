# 10 — AI, RAG & Safety Audit

**Baseline:** `origin/main @ 3a787c0`. Read-only source evidence. Paths relative to `backend/`.

## AI orchestration

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| USAM-AI-001 | Provider abstraction + fallback | **PARTIALLY_IMPLEMENTED** | Real `LLMProvider` interface + `BedrockAdapter` (`providers/bedrock.adapter.ts`) + `AIProviderService` map. But only Bedrock registered (`ai.module.ts:52-59`); `executeWithFallback` (`ai-provider.service.ts:191-214`) can never fire (`providers.size` always 1). Legacy `bedrock.service.ts` also hardwired. |
| USAM-AI-002 | Model router by task/complexity | **MISSING (dead code)** | `selectModel`/`selectModelByTaskType`/`costTier` (`ai-provider.service.ts:104-160`) exist but only via `executeTask()`, which **no caller invokes**. All real calls use `invoke()` → Bedrock default (Claude 3.5 Sonnet). No voice/moderation/coding routing wired. |
| USAM-AI-003 | Cost/latency tracking | **PARTIALLY_IMPLEMENTED** | `AIUsageLog` stores userId/service/model/tokens only. No `$` cost, no latency (adapter measures it but never stored). Logging only on legacy `BedrockService.invoke` (`bedrock.service.ts:106-115`); the main Phase-3 path (character/coaches) is **unlogged**. |

## RAG / retrieval

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| USAM-RAG-001 | Retrieval + filtering + attribution | **PARTIALLY_IMPLEMENTED** | `learner-context.service.ts::retrieveGroundingContext` is Postgres full-text (`websearch_to_tsquery`/`ts_rank`) over `concepts` (GIN `searchVector`) + `content_items` (PUBLISHED only), capped at 4, fails soft. NO embeddings/vector DB. |
| USAM-RAG-002 | Citation enforcement / vector DB decision | **WEAK / REQUIRES_RESEARCH** | Citation is prompt-level only (`formatRetrievedContext` duplicated in character/english/coding services). No server-side validation that model citations are real. `groundedIn[]` reflects prompt inputs, not model output. Vector-DB (Qdrant vs pgvector) decision open. |

## AI evaluation

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| USAM-AIEVAL-001 | Golden dataset | **PRESENT** | `test/ai-eval/golden-dataset.json` — 19 cases (coding/english/character) with keyword/length/structure rubrics. |
| USAM-AIEVAL-002 | Scoring | **PARTIALLY_IMPLEMENTED** | `scripts/run-ai-eval.ts` scores via deterministic keyword/structure heuristics (not semantic/LLM-judge). Persists `AIEvalRun`/`AIEvalResult`. Read API `admin-ai-eval.controller.ts`. |
| USAM-AIEVAL-003 | Admin UI + reproducibility | **PARTIALLY_IMPLEMENTED** | Backend read endpoints exist; a real `AdminAIEvalPage` frontend page exists in inventory (needs wiring verification). Reproducibility metadata (model/prompt/policy versions) partial. |

## Safety (child protection)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| USAM-SAFE-001 | Architectural safety layer | **PARTIALLY_IMPLEMENTED (strong on character path)** | `moderation.service.ts` = Presidio PII + Bedrock verdict, **fails CLOSED**. |
| USAM-SAFE-002 | 5-state model | **PRESENT** | `character-safety.service.ts`: `safe/restricted/blocked/escalation_required/parent_approval_required`; most-restrictive resolution; logs `ModerationLog`. |
| USAM-SAFE-003 | Moderation wired on conversation | **PRESENT (input)** | `conversation.service.ts::sendMessage` moderates learner input fail-closed, blocks on HIGH/CRITICAL. Character output re-checked inside `character.service.generateResponse`. |
| USAM-SAFE-004 | Escalation + human-in-loop | **PRESENT** | `safety-escalation.service.ts` queue (create/list/assign/resolve/stats); `REFERRED_TO_GUARDIAN` fires `PARENT_FLAG` notification. |
| USAM-SAFE-005 | Hallucination/low-confidence | **PARTIALLY_IMPLEMENTED** | `hallucination-control.service.ts`: off-topic detector + hedging-phrase regex → teacher-escalation hedge + `SafetyEscalation`. Heuristic, not grounding validation. |
| USAM-SAFE-006 | Coach-path safety coverage | **FAILING / GAP** | `english-coach.service.ts` + `coding-coach.service.ts` + legacy `ai.controller.ts` enforce **NO** input/output moderation or PII check. A child on `/english-coach` or `/coding-coach` gets no content moderation. |
| USAM-SEC-003 | AI tool/capability permission system | **MISSING** | No tool-use/function-calling framework, no per-agent capability allow-list. |
| USAM-SAFE-005 (red-team) | Red-team program | **PARTIALLY_IMPLEMENTED** | `test/red-team/` battery (26 cases). Only deterministic layer runs; all LLM-dependent cases are `describe.skip` (no Bedrock in CI). Honestly documents gaps (injection/jailbreak/in-person patterns, PII solicitation, single-message dependency). |

## Highest-priority AI/safety actions (for roadmap, not executed)

1. **Wire moderation + PII + safety into english-coach, coding-coach, and legacy ai.controller** (USAM-SAFE-006) — currently unprotected child-facing AI.
2. Decide model-router activation vs removal (USAM-AI-002 dead code).
3. Instrument cost/latency on the Phase-3 path (USAM-AI-003).
4. Decide vector-DB (Qdrant vs pgvector) + add server-side citation validation (USAM-RAG-002).
5. Extend red-team to real adversarial evaluation environment (USAM-SAFE-005).
