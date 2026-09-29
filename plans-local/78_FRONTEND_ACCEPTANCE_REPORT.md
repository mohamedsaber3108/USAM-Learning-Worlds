# 78 — Frontend Reconciliation: Final Acceptance Report

> Phase: full frontend reconciliation with the real backend platform. This
> report answers the three acceptance questions, summarizes coverage, routes,
> mocks, and blockers, and is honest about what is code-verified vs what needs a
> live environment.

Branch: `fix/p0-p1-remediation` · Canonical frontend: `frontend/` · HEAD at report time: `ca8a79a`.

## Verification status legend

- ✅ **code-verified** — built/typechecked/tested here (tsc clean, 40 vitest, home-bundle gate).
- 🟡 **pending live** — correct in code, needs deploy + browser/human QA in a real environment (server + Bedrock + devices) which is the owner's to run.
- ⛔ **blocked** — needs an owner decision (Lovable) or a backend endpoint that does not exist yet.

## The three acceptance questions

### 1. Can a child experience every engine without knowing backend engines exist?
**Substantially yes (code-verified), live QA pending.** Every learner-facing
surface speaks child language, never backend jargon:
- Coding hides `executionPolicy`/`testModelVersion`/`runner` (used only for
  branching); shows Run/Output/Results/"All checks passed!". ✅
- Mastery is shown as child bands (new/learning/practicing/getting strong/
  mastered) via `lib/mastery/masteryLabels.ts` — never the raw `MasteryState`
  enum or a confidence decimal. ✅
- Age is shown as product bands 7-9 / 10-12 / 13-15 via `lib/age/ageLabels.ts`
  — never the internal `AGE_8_9`/`AGE_10_11`/`AGE_12_14` enum. ✅
- Review/FSRS is framed as "keep it strong", not "FSRS scheduled item". ✅
- Companions (15 bespoke animated SVGs) carry idle/listening/thinking/speaking/
  encouraging/celebrating/error states. ✅

### 2. Can a parent understand real learning, evidence, mastery, projects, next?
**Yes for learning/evidence/mastery/projects/time/plan (code-verified); safety pending a backend endpoint.**
The parent dashboard uses only real endpoints (getChildren / getChildDashboard /
getChildActivity / entitlements.getMine): mastery breakdown incl. by-domain avg
confidence ("what can they do"), recent evidence activity, 7-day missions/
projects log, and a real "Your plan" panel ("what am I paying for"). No mock
analytics. ✅ · **Gap:** no parent-facing *safety* endpoint exists on the
parents controller — a safety panel was intentionally NOT invented. ⛔(backend)

### 3. Does every major backend capability have a deliberate frontend representation?
**Yes** — see the coverage ledger (`76_FRONTEND_ENGINE_COVERAGE.md`). Notable
gaps closed this phase: Practice/Review (`/practice`, the FSRS engine had zero
consumers), Evidence (`/evidence`), generic domain path (`/learning/domains/
:slug/path`), AI-Literacy path CTA, Creativity CREATE loop, coding test-model,
project→competency link, parent plan panel.

## What was built/fixed this phase (all shipped + pushed)

| Area | Result | Commit |
|---|---|---|
| Coding trust model + 11 adversarial tests + threat model doc | ✅ | e70e6b6 |
| Engine coverage ledger (76) | ✅ | 8960e68 |
| Coding test-model ported to canonical frontend | ✅ | 47df73d |
| Home IA + review-due + mastery-count bug fix | ✅ | 7f9008d, 051bbb1 |
| Shared domain-path pattern (`/learning/domains/:slug/path`) | ✅ | 1c182fc |
| Coding UX localized (jargon-free) | ✅ | 9ffe3d5 |
| AI-Literacy mission-path CTA | ✅ | a4a64f1 |
| **Architecture: frontend/ canonical + migration ledger (77)** | ✅ | 3d36cfa |
| Creativity CREATE→CREATION loop | ✅ | 670adef |
| Evidence child view (`/evidence`) | ✅ | 69efcf3 |
| Projects: Project→Competency link + localize detail | ✅ | 2ecf694 |
| Characters state machine + Voice companion/localize | ✅ | 996b8a1 |
| Parent "Your plan" (entitlements) panel | ✅ | ba04334 |
| Age model: product-facing 7-9/10-12/13-15 labels + doc | ✅ | 069982d |
| Route inventory + mock sweep (in 76) | ✅ | 89d53c0 |
| Perf: coding runtime off Home + gate + E2E scaffold | ✅ | ca8a79a |

## Coverage snapshot

- **Routes:** 44, all classified FINAL (public/onboarding/child/parent/admin) — no DELETE/MERGE/duplicate routes. See 76.
- **Mocks in `frontend/src`:** **0** (grep clean). Empty states are honest CharacterState components.
- **i18n:** every new/changed surface localized EN + AR (RTL); `ar` is type-checked against `en`'s shape.
- **Tests:** backend 120 / 21 suites; frontend 40 / 11 files; frontend tsc clean; home-bundle perf gate passing.
- **Perf evidence:** ✅ **Browser-verified** — Home fetches NO coding runtime (sandpack/codemirror/pyodide). A real Playwright network trace (`e2e/home.spec.ts`) caught that the static index.html check alone MISSED a leak (Vite hoisted its preload helper into the sandpack chunk, which the entry statically imported); fixed by not manual-chunking the coding runtime. Gated in deploy.sh + CI via the upgraded `check-home-bundle.mjs` (now asserts the entry chunk, not just index.html).
- **E2E (browser-verified this workspace):** ✅ 16 Playwright tests pass in chromium against the production build — `home.spec.ts` (2: Home render + no-coding-runtime + Arabic RTL) and `routes.spec.ts` (14: every canonical child route mounts with no uncaught errors, unknown-route fallback, Arabic RTL). API boundary mocked (no live USAM backend in dev workspace); real-data round-trips are the owner's live pass.

## Architecture resolution (dual frontend)

- `frontend/` declared **canonical** with evidence (deploy.sh + CI build it); documented in `docs/architecture/FRONTEND_CANONICAL.md` + AGENTS.md; enforced by CI job `frontend-canonical-guard` + `src/LEGACY_DO_NOT_EDIT.md` marker.
- Root `src/` (Lovable scaffold, `.lovable` template): **PRESERVE / QUARANTINE — NON-PRODUCTION** (owner decision — NOT to be deleted; Lovable-managed, kept unless the project later migrates away from Lovable). Frozen for product work, marked + CI-guarded. It has NO unique backend wiring; its only unique code-value (design-reference UX + Arabic plural strings) is preserved in `77`.

## Age model status — COMPATIBILITY MODE / MIGRATION PENDING

**NOT fully resolved.** Canonical product bands are 7–9 / 10–12 / 13–15; the
persisted `AgeBand` enum is `AGE_8_9`/`AGE_10_11`/`AGE_12_14` and does not cleanly
represent age 7 or 15. A **display compatibility layer** (`lib/age/ageLabels.ts`)
maps enum→product band; the persistence model is unmigrated. Non-destructive
migration plan documented in `docs/architecture/AGE_MODEL.md`. Launch is not
blocked on it, but it stays MIGRATION PENDING until the backend model is migrated.

## Deploy-gate rehearsal (LOCAL, real runs — not the prod deploy)

Every deploy gate that does NOT require the live prod DB/server was executed
locally and passed (real evidence, this workspace):

| Gate | Result |
| --- | --- |
| backend build (`nest build`) | ✅ exit 0 |
| backend tests (`jest --runInBand`) | ✅ 120 passed / 21 suites |
| frontend typecheck (`tsc --noEmit`) | ✅ clean |
| frontend build (`vite build`) | ✅ built in ~8s |
| frontend tests (`vitest run`) | ✅ 40 passed / 11 files |
| home-bundle perf guard | ✅ no coding runtime on Home (8 eager JS refs checked) |
| `check:enum-drift`, `check:migrations` | ⏳ server-only (need live `DATABASE_URL`) |
| critical smoke (real DB over HTTP) | ⏳ server-only (CI `smoke` job / prod) |

So the deploy is expected to pass its code gates; the two DB-drift gates + smoke
run on the server where the prod `DATABASE_URL` exists.

## Blockers / pending (honest)

- ✅ **Legacy `src/`: PRESERVE / QUARANTINE — NON-PRODUCTION** (owner decision; NOT deleted, NOT a blocker). Marked + CI-guarded.
- ⛔ **Live deploy + verification (task #17 remainder):** THIS WORKSPACE HAS NO NETWORK PATH TO THE PROD SERVER — DNS resolution to `kids.usamif.com`/github fails intermittently, there is no SSH host config for `~/USAM-Learning-Worlds`, and `scripts/deploy.sh` requires the server's pm2/nginx/`DATABASE_URL`. The deploy + live browser verification MUST be run by the owner on the server. I did not fabricate deploy/live output.
- 🟡 **Multi-device / age / language human browser QA (tasks #14/#16 remainder):** Playwright harness is scaffolded (opt-in); full human visual pass across 7-9/10-12/13-15 × phone/tablet/desktop × EN/AR needs a real environment.
- 🟡 **Voice runtime:** ASR/TTS/Bedrock sidecar is provider-gated; text-fallback path is code-verified, live voice round-trip needs creds.
- ⛔ **Backend gaps (noted, not faked):** no `GET /mastery/evidence` per-evidence timeline; no parent-facing safety endpoint. Current surfaces are honest without them.

## Recommended next steps for the owner

1. Confirm whether the Lovable scaffold (root `src/`) can be removed; if yes, I execute the salvage-then-delete plan in `77` as a separate commit.
2. Run `DEPLOY_BACKEND=1 RUN_TESTS=1 bash scripts/deploy.sh` on the server; the new home-bundle gate + existing enum/migration/test gates must pass.
3. Run the opt-in Playwright suite (`e2e/README.md`) + a human QA pass on the three age bands and Arabic RTL on phone/tablet/desktop.
4. If a per-evidence timeline and a parent safety panel are wanted, add the two backend read endpoints; the frontend surfaces are ready to consume them.
