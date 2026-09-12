# 08 — Character System Audit

**Baseline:** `origin/main @ 3a787c0`. Read-only evidence (backend + frontend).

## Findings

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| USAM-CHAR-001 | ONE configurable framework | **CONFIRMED_COMPLETE** | Single `Character` Prisma model (row-per-character: name/role/personality Json/systemPrompt/avatarUrl). One `CharacterService.generateResponse` (`character.service.ts:322-520`) is the only code path for all 15; `buildCharacterSystemPrompt` composes from row data + age instructions + relationship + mode block + versioned `PromptTemplate` guidelines + grounding. No hardcoded per-character bots. |
| USAM-CHAR-002 | 15 canonical characters | **CONFIRMED_COMPLETE (seed source)** | `seed-character-universe.ts` defines all 15 (Azouz, Zein, Luma, Codey, Nova, Mira, Rami, Faris, Tala, Adam, Byte, Nour, Rex, Zara, Atlas) with nameAr/role/personality/systemPrompt + shared `SAFETY_FOOTER`; idempotent upsert. Frontend `FALLBACK_ROSTER`/`CHARACTER_VISUALS` mirror all 15. **Caveat:** not confirmed the master seed runner invokes it, nor that a live DB is populated → verify in DB audit. |
| USAM-CHAR-003 | Character Orchestrator | **MISSING** | No orchestration/handoff logic anywhere (`orchestrat*/selectCharacter/routeToCharacter` = 0 hits). Selection is purely user-driven (`/characters/:id/chat`). What exists is a progressive **unlock** system (`getUnlockedCharactersForLearner`, `character.service.ts:118-232`) with real per-learner triggers — unlock ≠ orchestration. |
| USAM-CHAR-004 | Memory scope + privacy | **PARTIALLY_IMPLEMENTED** | `CharacterInteraction` (append-only log), `CharacterState` (per-pair relationshipLevel/interactionCount), `Conversation`/`ConversationMessage`. Retention metadata: `ConversationMessage.retentionDays=180`, `LearnerContext.retentionDays=90` + memory-governance service. **Gaps:** no confirmed purge job runs; standalone `/chat` path doesn't feed prior message history (no prompt-level memory window). |
| USAM-CHAR-005 | Child-safety in dialogue | **CONFIRMED_COMPLETE** | `character-safety.service.ts`: deterministic `PARENT_BYPASS_PATTERNS` (secrecy) + `DEPENDENCY_PHRASES` (attachment) → `parent_approval_required`/escalation; `evaluateSafety` checks input AND output bidirectionally; every seeded systemPrompt carries `SAFETY_FOOTER` ("never claim to be human… never encourage secrecy… encourage talking to a trusted adult"). |
| USAM-AVATAR-002 | Animation states + surfaces | **PARTIALLY_IMPLEMENTED** | `CharacterFace.tsx`: 15 bespoke framer-motion SVGs + idle bob/breathe, staggered blink, per-character motifs, relationship-driven evolution glow (stages 1-5 from `CharacterState.relationshipLevel`), locked silhouette, reduced-motion off-switch. **Gap:** no discrete mood/talking/thinking/speaking poses (backend returns `mood` but avatar doesn't render it). Surfaces (`CharacterGalleryPage`/`CharacterChatPage`) wired to real `charactersApi`; gallery has `FALLBACK_ROSTER` mock + a **stale comment** claiming `/characters` + `/characters/unlocked` aren't live though the backend implements both. |

## Notable discrepancies

- **Stale frontend comment** (`endpoints.ts:433-444`) claims character list/unlocked endpoints aren't live; backend `CharacterController` implements both. The mock fallback is therefore defensive, not required — but the **double-`/api/api`-prefix bug (BE-R2)** means the frontend calling `/api/characters` would actually 404 against the mis-declared controller. This is a real, currently-broken contract. → cross-ref `04_BACKEND_AUDIT` BE-R2 + `06_API_AND_CONTRACT_AUDIT`.
- Character chat `POST /characters/:id/chat` 500s at the Bedrock credential step in non-configured environments (documented).

## Character-system actions (for roadmap)

1. Fix BE-R2 double prefix so character endpoints are reachable, then remove the stale "not live" comment + reduce mock fallback to a true offline/error fallback only.
2. Build the **Character Orchestrator** (USAM-CHAR-003): mission/objective/domain context → suggested/active character, respecting unlock state.
3. Add mood/talking animation states to `CharacterFace` driven by backend `mood` (USAM-AVATAR-002).
4. Confirm/seed all 15 in the live DB via the master seed runner; add a memory-purge job for retention (USAM-CHAR-004).
