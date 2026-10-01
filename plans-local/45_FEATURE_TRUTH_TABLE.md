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
| Entrepreneurship domain | THIN | MOCK | REBUILD | thinnest content (no breadth seed); priority build (28/13) |
| Missions + player | PRESENT | MOCK | MISWIRED | engine runs (coding proved it); FE mock |
| Mastery + evidence | PRESENT | MOCK | PARTIAL | MasteryRecord/Evidence; FSRS review; FE mock |
| Review scheduling (FSRS) | PRESENT | — | PARTIAL | ts-fsrs adopted (migration 20260910); verify runtime |
| Adaptive/session engine | PARTIAL | MOCK | REFACTOR | keys off confidence only; wire age+interests+load (31) |
| Diagnostic/placement | PARTIAL | MISSING | PARTIAL | questions/difficulty infra; end-to-end flow unverified |
| Characters (15 roster) | PRESENT | MISWIRED | PARTIAL | 15 seeded exact names; FE has old 10-name cast (23) |
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
| Memory-governance admin | PRESENT | — | BLOCKED | authz gap — WITHHELD until RolesGuard fix (35 §2) |
| **Landing page** | static | REBUILT | LIVE | REBUILT on locked 4 domains + AI/Entrepreneurship + journey/companions/parent/pricing/§17; DEPLOYED live 9ab70cc (kids.usamif.com, verified 200 + bundle match); visual QA = owner-run (46) |
| **Learner Home/Dashboard** | real APIs | REAL+scope-fixed | LIVE(existing)/PARTIAL | Dashboard already REAL (gamification/mastery/missions/cosmetics/dailyGoals APIs, age-adaptive, recommendations, review-due, honest states). Fixed: quick-actions now lead with the 4 LOCKED domains (was generic worlds+leaderboard); AI→/learning/domains/ai-literacy/path, Entrepreneurship→.../entrepreneurship/path. lint+tsc+build+40 tests green. Not yet re-deployed. |
| **Domain path page** | learning/domains/:slug/path | REAL+Entrepreneurship added | PARTIAL | Generic slug-driven page (english/coding/ai-literacy/creativity/entrepreneurship). Added Entrepreneurship config (Adam mentor) + EN/AR i18n. Entrepreneurship CONTENT still thin (13). |
| CI lint health | — | FIXED | — | Fixed 2 pre-existing CI-lint blockers (vitest-axe stale eslint-disable rule name; Toast react-refresh). `npm run lint` now exit 0. |
| Cache/SW hygiene | nginx+verify | FIXED | LIVE | /sw.js+/service-worker.js→404; index.html no-cache; assets immutable. verify-deployment.sh [C] guards it. Confirmed live (verify GREEN). docs/ops/NGINX_CACHE.md. |
| **Learn hub (/learn)** | curriculum/learning/worlds/mastery APIs | REAL+scope-fixed | LIVE(existing)/PARTIAL | Was framed as generic "Curriculum/every subject" + 7 school-subject worlds. Re-framed around the 4 LOCKED domains as the spine (prominent cards → domain-path); thinking/cross-curricular demoted to "supporting"; AI/Entrepreneurship promoted out of cross-curricular. Real world-path + concept browser kept. seed-worlds.ts rewritten to 4 domains (Wordhaven/CircuitCity/Mindspring/LaunchBay) — fixes would-be-empty world path. Not yet redeployed. |
| World seed | seed-worlds.ts | FIXED | — | Was 7 school-subject worlds (mathematics/science/... slugs) → all would skip post-domain-fix. Now 4 worlds mapped to english/coding/ai-literacy/entrepreneurship slugs. |

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
- PERF FINDING (directive §19): one vendor chunk `vendor-D50g1LQf.js` = **1.9 MB**
  (gzip 531 kB) — code-split in the hardening phase. Status: REFACTOR (perf).
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
