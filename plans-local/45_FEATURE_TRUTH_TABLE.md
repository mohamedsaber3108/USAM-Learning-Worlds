# 45 — FEATURE TRUTH TABLE

> Directive §38: every feature's real status with EVIDENCE. Status vocab:
> PRODUCTION_READY · PARTIAL · BROKEN · MISWIRED · MOCK_ONLY · MISSING ·
> DUPLICATED · OBSOLETE · REFACTOR · REBUILD · DELETE · BLOCKED.
> **Nothing is PRODUCTION_READY without evidence.** "Backend" = model+module
> verified in schema/src this session; "Frontend" = root `src/` state;
> UNVERIFIED = runtime not yet confirmed (grep can't index backend; no live run
> here). This table is the living acceptance ledger — updated during Gate-5
> execution with real evidence.

Date: 2026-09-30 (pre-execution baseline)

---

## Legend for the two axes
- **BE** = backend (model + module/controller present & plausibly wired).
- **FE** = frontend in root `src/` (MOCK_ONLY unless noted).
- **Overall** = the honest end-to-end status for the LOCKED product.

| Feature | BE | FE | Overall | Evidence / note |
|---|---|---|---|---|
| Auth (login/register/me/refresh) | PRESENT | MOCK/partial | PARTIAL | auth controller verified; no reset/verify/OAuth (PG-21/22) |
| Roles & guards | PRESENT | partial | PARTIAL | RolesGuard; FE role routing to rebuild |
| Curriculum graph (4 domains) | PRESENT | MOCK | REBUILD(seed)+MISWIRED(FE) | schema graph solid; seed=12 wrong domains; FE mock |
| English domain | PARTIAL | MOCK | PARTIAL | strands+slice+A1/A2 breadth; FE mock; speaking needs voice+types |
| Coding domain | PARTIAL | MOCK | PARTIAL | concepts+slice+A1+sandbox; FE mock |
| AI domain | PARTIAL | MOCK | PARTIAL | slice+A1; concepts flat (wire to graph); FE mock |
| Entrepreneurship domain | SLICE SEEDED | REAL(domain-path) | PARTIAL | Authored seed-entrepreneurship-slice.ts (Domain→Skill 'From Idea to Pitch'→Competency 'Find a real problem A1'→Objective→4 activities SELECT/SELECT/MATCH/EXPLAIN→Mission 'My First Big Idea', Adam mentor, Problem→Idea→User→Pitch, no real money). Follows proven English/Coding slice pattern; backend tsc clean; npm run seed:entrepreneurship:vertical. Surfaced via DomainPathPage(entrepreneurship) + /cross-curricular/entrepreneurship (both real). Breadth beyond A1 slice still to author. |
| English domain surface | englishApi strands/path | REAL | LIVE(existing) | EnglishStrandsPage already reconstruction-quality: real 9 strand families + CEFR + shared DomainLearningPath spine (live mastery), Luma mentor, i18n, honest states. No change (§5). |
| Coding domain surface | coding-sandbox/concepts | REAL | LIVE(existing) | CodingPage tested + real. No scope defect. (§5) |
| AI domain surface | cross-curricular/domain-path | REAL | LIVE(existing) | Via DomainPathPage(ai-literacy) + cross-curricular (real useQuery). |
| Missions + player | PRESENT | MOCK | MISWIRED | engine runs (coding proved it); FE mock |
| Mastery + evidence | PRESENT | MOCK | PARTIAL | MasteryRecord/Evidence; FSRS review; FE mock |
| Review scheduling (FSRS) | PRESENT | — | PARTIAL | ts-fsrs adopted (migration 20260910); verify runtime |
| Adaptive/session engine | PARTIAL | MOCK | REFACTOR | keys off confidence only; wire age+interests+load (31) |
| Diagnostic/placement | PARTIAL | MISSING | PARTIAL | questions/difficulty infra; end-to-end flow unverified |
| Characters (15 roster) | PRESENT | REAL | LIVE(existing) | CORRECTED: CharacterGalleryPage already uses the locked 15 roster (Azouz..Atlas) via real charactersApi (unlocked→list→Azouz fallback chain), live AR blurbs, honest unlock hints. NO old 10-name cast anywhere in frontend/ (verified scan). Fixed 2 stale "endpoints will ship" notes (they exist). Azouz primary. (§5 kept) |
| Voice | PRESENT | REAL | LIVE(existing) | VoiceChatPage = real round-trip (voiceApi.turn ASR→AI→TTS→VoicePlayer), real sidecar-unavailable→text fallback, honest states (Tala companion), captions, "playback unavailable" honesty. Not decorative (§14 satisfied). conversationId input is dev-ish UX (noted, not blocking). (§5 kept) |
| Azouz orchestration | PRESENT | MOCK | PARTIAL | orchestrate/unlocked/conversation endpoints exist |
| Voice (STT/TTS) | PRESENT | MOCK | PARTIAL | provider-independent (Whisper/Piper+WER); FE wire; EG-Arabic UNVERIFIED |
| Projects + rubrics | PRESENT | MOCK | PARTIAL | models+cross-domain engine+seed; FE mock |
| Portfolio | PARTIAL | MOCK | PARTIAL | project list today; richer surface needed (33) |
| Credentials (Open Badges) | PRESENT | MISSING | PARTIAL | Credential models+migration; FE+verify page needed |
| Gamification (XP/streak/cosmetics) | PRESENT | MOCK | PARTIAL | engine+cosmetics seed; verify achievement persistence |
| Daily goals | PRESENT | MOCK | PARTIAL | DailyGoal model+module |
| Stories | PRESENT | MOCK | PARTIAL | Story/StoryPage + seed |
| Simulations | PRESENT | MOCK | PARTIAL | SimulationScenario + seed |
| Entitlements/packaging | PRESENT | MISSING | PARTIAL | Plan/Subscription/EntitlementsService + plans seeded; FE+gates to wire |
| Pricing/plans UI | PRESENT(data) | MISSING | PARTIAL | plans seeded; UI + configurable display to build |
| Payment gateway | ABSTRACTION | — | BLOCKED | manual provider; real gateway external+owner-gated |
| Usage limits (voice/missions) | PARTIAL | — | PARTIAL | getLimit exists; usage METER to build (10 §6) |
| Parent system | PRESENT | thin | PARTIAL | parents/legal/notifications; FE per 16 |
| Safety/moderation | PRESENT | MISSING(mod UI) | PARTIAL | moderation/escalation/policies; mod surfaces NEW |
| Consent/privacy (COPPA/GDPR) | PRESENT | partial | PARTIAL | ConsentRecord/DataSubjectRequest |
| Admin/content/QA | PRESENT | MISSING | PARTIAL | content-items/qa/provenance/curriculum-mapping; admin UI NEW |
| Notifications | PRESENT | MISSING | PARTIAL | Notification model+module; FE wire |
| Search | PRESENT | partial | PARTIAL | search module (+pgvector embeddings) |
| i18n EN/AR + RTL | PRESENT | partial | PARTIAL | i18next + translations (human-approval); RTL pass needed |
| Design system | PRESENT(FE) | PRESENT | PARTIAL | src/design mature; adopt; palette owner decision |
| Memory-governance admin | PRESENT+GUARDED | REAL | LIVE(existing) | CORRECTED (earlier "authz gap WITHHELD" was a FALSE ALARM): backend getStats checks user.role ADMIN/MODERATOR → ForbiddenException (same in-method pattern as FeatureFlagController); frontend /admin/memory-governance wrapped in <AdminRoute>. Secure on both layers. Not a hole. (Could later refactor to RolesGuard+@Roles for consistency — not a security fix; left as-is since working & secure.) |
| Parent dashboard | parentsApi + entitlementsApi | REAL | LIVE(existing) | Real children/dashboard/activity/safety + entitlements, honest price formatting, 403 handling, age labels. Full parent loop (16). No change (§5). |
| Plans / pricing | entitlementsApi listPlans/getMine/subscribe | REAL | LIVE(existing) | Reads seeded 4 plans, real feature-flag rendering, manual-provider immediate activation + future-gateway checkoutUrl path, no hardcoded prices. Aligns with 10/11. No change (§5). |
| Admin surfaces (16 pages) | admin controllers | REAL | LIVE(existing) | 43 real useQuery/apiClient usages; task-oriented; proper RolesGuard+@Roles / in-method ADMIN checks; AdminRoute on FE. No mocks (setTimeout/mockData=0). "school-subject" string hits = false positives (prompt-template/safety content). No change (§5). |
| Moderation (safety-escalations) | safety-escalation controller | REAL | LIVE(existing) | RolesGuard + @Roles(MODERATOR/ADMIN). Real. (§5) |
| **Landing page** | static | REBUILT | LIVE | REBUILT on locked 4 domains + AI/Entrepreneurship + journey/companions/parent/pricing/§17; DEPLOYED live 9ab70cc (kids.usamif.com, verified 200 + bundle match); visual QA = owner-run (46) |
| **Learner Home/Dashboard** | real APIs | REAL+scope-fixed | LIVE(existing)/PARTIAL | Dashboard already REAL (gamification/mastery/missions/cosmetics/dailyGoals APIs, age-adaptive, recommendations, review-due, honest states). Fixed: quick-actions now lead with the 4 LOCKED domains (was generic worlds+leaderboard); AI→/learning/domains/ai-literacy/path, Entrepreneurship→.../entrepreneurship/path. lint+tsc+build+40 tests green. Not yet re-deployed. |
| **Domain path page** | learning/domains/:slug/path | REAL+Entrepreneurship added | PARTIAL | Generic slug-driven page (english/coding/ai-literacy/creativity/entrepreneurship). Added Entrepreneurship config (Adam mentor) + EN/AR i18n. Entrepreneurship CONTENT still thin (13). |
| CI lint health | — | FIXED | — | Fixed 2 pre-existing CI-lint blockers (vitest-axe stale eslint-disable rule name; Toast react-refresh). `npm run lint` now exit 0. |
| Cache/SW hygiene | nginx+verify | FIXED | LIVE | /sw.js+/service-worker.js→404; index.html no-cache; assets immutable. verify-deployment.sh [C] guards it. Confirmed live (verify GREEN). docs/ops/NGINX_CACHE.md. |
| **Learn hub (/learn)** | curriculum/learning/worlds/mastery APIs | REAL+scope-fixed | LIVE(existing)/PARTIAL | Was framed as generic "Curriculum/every subject" + 7 school-subject worlds. Re-framed around the 4 LOCKED domains as the spine (prominent cards → domain-path); thinking/cross-curricular demoted to "supporting"; AI/Entrepreneurship promoted out of cross-curricular. Real world-path + concept browser kept. seed-worlds.ts rewritten to 4 domains (Wordhaven/CircuitCity/Mindspring/LaunchBay) — fixes would-be-empty world path. Not yet redeployed. |
| World seed | seed-worlds.ts | FIXED | — | Was 7 school-subject worlds (mathematics/science/... slugs) → all would skip post-domain-fix. Now 4 worlds mapped to english/coding/ai-literacy/entrepreneurship slugs. |
| **Missions browse** | missionsApi.browse | REAL+scope-fixed | PARTIAL | Removed broken filters (numeric domain ids 1-5 Math/Science/History + difficulty — both ignored by backend `/missions` which returns all unfiltered). Now real client-side search + mission-type filter (GUIDED/EXPLORATION/CHALLENGE/PROJECT_BASED enum). No fake params. Not yet redeployed. |
| Missions detail | missionsApi.getById/start | REAL | LIVE(existing) | Already correct: real APIs, real ActivityType icons, honest states, /missions/play/:runId nav. i18n gap (hardcoded EN) = task-7. No scope defect. Kept per §5. |
| Missions player + complete | missionsApi getRun/submit/complete | REAL | LIVE(existing) | Teach-step + complete flow tested (MissionPlayerPage.test, MissionCompletePage.test, teaching.test all pass). No scope defect found. |
| Practice (FSRS review) | masteryApi.getReviewDue + adaptiveApi | REAL | LIVE(existing) | Already reconstruction-quality: real review-due + recommendations, child-friendly mastery labels, honest states, i18n. No change (§5). |
| Evidence ("what I proved") | masteryApi.getOverview | REAL | LIVE(existing) | Already real + honest (explicit note: uses real mastery overview, no invented per-artifact evidence; flags follow-up endpoint). No change (§5). |
| Portfolio + credentials | projectsApi/masteryApi/credentialsApi | REAL | LIVE(existing) | Already real: mastery + Open-Badges credentials + showcased projects, honest empties, "no fake data". No change (§5). |
| Progress | gamification/mastery/missions/streak-freeze | REAL+bugfix | PARTIAL | Fixed real MasteryState bug: learningCount used 'NOVICE' (not in enum) + omitted INTRODUCED/EXPLORING/PRACTICING. Now uses shared masteryLabel band (matches Dashboard). Not yet redeployed. |

## Honest headline (pre-execution)

- Backend: broadly PRESENT/PARTIAL (very mature). Few true MISSING.
- Frontend (root `src/`): dominant status MOCK_ONLY / MISWIRED / MISSING — this
  is where the rebuild work concentrates.
- BLOCKED (external/owner): real payment gateway; memory-governance authz;
  EG-Arabic voice accuracy UNVERIFIED; legal copy.
- NOTHING here is marked PRODUCTION_READY yet — that status is earned per feature
  during Gate-5 execution with build+test+observed-QA evidence.

---

## PHASE A UPDATE (2026-09-30) — canonical tree `frontend/` baseline VERIFIED

> CORRECTION: the "frontend = root src/ mock" framing above applied to the LEGACY
> tree. The CANONICAL tree is `frontend/` (deploy-chain verified). `frontend/` is
> largely REAL (axios `endpoints.ts`, 61 groups), not mock. Baseline measured:

- `frontend/`: `tsc --noEmit` **PASS**; `npm test` **40/40 pass (11 files)**;
  `npm run build` **PASS**; `check:home-bundle` **PASS**. Healthy real app.
- PERF FINDING (directive §19) — INVESTIGATED, documented tradeoff: the 1.9 MB
  `vendor` chunk contains the CODING RUNTIME (sandpack + codemirror + blockly +
  monaco), not stray libs ("moment" fingerprint = false positive; not a dep).
  The home-bundle gate PASSES — this runtime is NOT statically imported by the
  entry (Home load graph is clean). It is a lazy chunk that is modulepreload-
  HINTED. The prior engineer's vite.config documents (with an e2e proof) that
  force-splitting sandpack/pyodide into named chunks REGRESSED it worse
  (hoisted __vitePreload into the entry, dragging ~950kB into Home). So further
  splitting is NOT a safe quick fix — it needs the e2e network assertion
  (e2e/home.spec.ts) as a guard. Tried a Radix split (safe) — no size impact
  (Radix tree-shakes small), reverted to keep the validated config. Status:
  KNOWN TRADEOFF (REFACTOR behind e2e guard), not a blind code-split. Honest:
  Home does not block on this chunk, but the preload hint could be trimmed in a
  dedicated e2e-guarded perf pass.
- SCOPE-VIOLATION FINDING (landing, directive §17): `landing/LandingPage.tsx`
  presents the OLD 6 "worlds" = Math/Science/Language/Coding/Arts/World — the
  REJECTED generic school-subject model, NOT the locked 4 domains. No AI or
  Entrepreneurship domain presence; missing voice/projects/portfolio/packages/
  pricing sections (§17). Status: REBUILD (scope-wrong). Hero already uses the
  correct 4 new characters (Azouz/Zein/Luma/Codey) ✓.
- Characters: `frontend/src/features/characters/components/CharacterFace.tsx` SVG
  system exists + `characterPreference` lib. Reconcile to the 15 roster (23).

Each `frontend/` feature dir will be audited against the product definition and
marked here (verify/finish/rebuild) as Phase A proceeds. EXISTENCE != COMPLETE.
