# USAM Kids — Complete Frontend Transformation: Tasks

Continuation of the same batch cadence as
`plans-local/89_COMPLETE_HISTORY_RECONCILIATION_LEDGER.md` (rounds 1-19
already executed there, all deployed/live-verified except round 19 which is
pushed and pending the owner's deploy — see §"Status" there for the current
checkpoint). This file tracks the *new*, broader rebuild batches from the
Master Execution Directive; it does not duplicate ledger 89's per-round
detail.

## Batch 1 — Shell, tokens, character-state audit (IN PROGRESS)

- [x] Audit `tailwind.config.js` + `FINAL_USAM_DESIGN_SYSTEM.md` — confirmed
      real, deliberate Decision A (WHITE/GREEN/BLACK, no per-feature hue).
- [x] Audit `CharacterFace.tsx`/`CharacterStage.tsx` — confirmed real,
      strong 15-character SVG system with 7 interaction states.
- [x] Audit `AppShell.tsx` — confirmed real, role-aware nav, no gaps found
      this pass.
- [x] Record the Decision-A / "visual environments" resolution in
      `design.md` rather than silently picking a side.
- [x] Close one real gap: `MissionPlayerPage.tsx` companion now shows
      `thinking` while `submitting` (previously `idle` with no feedback
      during grading) — reuses the existing state machine, no new state
      added. (Commit pending this batch's checkpoint.)
- [ ] Grep every learner-facing page for `CharacterStage`/`CharacterFace`
      usage vs. pages that have a real companion/orchestrate call but don't
      render it (or vice versa) — systemic pass, broader than the single
      fix above.
- [ ] Verify full gate (tsc/lint/vitest/build/check:home-bundle), commit,
      push, give deploy block, independently verify live once deployed.

## Batch 2 — Learn/Worlds/Mission Detail/Mission Player depth

- [ ] Re-audit `WorldDetailPage.tsx` mission list against directive §11's
      node vocabulary (current/completed/available/locked/next/optional/
      project/practice/story/simulation/challenge/reward) — confirm which
      of these the backend actually distinguishes today vs. which would
      require a new backend contract (do not fabricate).
- [ ] Mission Brief (`MissionDetailPage.tsx`) — confirm it already shows
      scene/title/objective/skills/activities/duration/reward/companion
      briefing/requirements/START per directive §18; list any real gaps.
- [ ] Mission Player completion — confirm "no dead end" (directive §19);
      ledger 89 §2.17/§2.18 already closed next-step-link + mastery-impact;
      confirm nothing regressed.

## Batch 3 — Practice/Progress/Rewards

- [x] (ledger 89 §2.25) Rewards achievements real-shape bug fixed —
      backend's 18-milestone system was silently unreachable from the UI.
- [ ] Progress/Mastery — confirm child-language labels (no raw confidence
      values) per directive §21; audit `masteryLabel` usage coverage.
- [ ] Practice — confirm review-due/flashcards/skill-practice/quick-session
      real coverage vs. directive §20's list; ledger 89 §2.19 already fixed
      the review-due dead-end.

## Batch 4 — English/Coding/AI Literacy/Creativity/Thinking

- [ ] Per-area audit: real backend capability (controllers/DTOs) vs. real
      frontend coverage, same method as ledger 89. Not started this batch.

## Batch 5 — Stories/Simulations/Projects/Portfolio

- [ ] Not started. Ledger 89 §2.20 already added real Research Notes to
      Projects; §2.21 explicitly flagged Collaboration as
      `BLOCKED_EXTERNAL` (needs an owner safety decision, not code).

## Batch 6 — Voice architecture

- [ ] Confirm current state stays honestly gated (no provider available);
      review whether a provider-independent state-machine scaffold
      (idle/listening/thinking/speaking/paused/muted/error) is worth
      building ahead of a provider, or premature per directive §38's
      "no decorative demos" rule. Decision pending, not started.

## Batch 7 — Search/Notifications/Settings

- [ ] Not started.

## Batch 8 — Guardian/Moderator/Admin

- [ ] Guardian audited clean in ledger 89 §2.14 (zero gaps). Moderator
      gained a drill-in (§2.14). Admin has had 5 real capabilities added
      across ledger 89 rounds. Re-evaluate against directive §32/§33/§34's
      explicit framing (Guardian's "5 questions", Moderator's
      queue→case→decision→audit model) — not yet explicitly re-checked
      against that framing.

## Batch 9 — RTL/responsive/a11y/performance pass

- [ ] Not started as a dedicated pass (individual fixes have been
      RTL/a11y-aware as built, per existing i18n/`dir` conventions, but no
      systematic audit has been run this session).

## Batch 10 — Landing/Auth/Onboarding re-evaluation

- [ ] Not started. Landing already went through one real rebuild in a
      prior session (character presence, ledger 88); directive §13
      requests a blank-slate re-evaluation, not assumed complete.

## Cross-cutting (tracked continuously, not a single batch)

- [ ] `docs/reconstruction/FEATURE_BACKEND_MATRIX.md` — full backend
      controller → disposition matrix (directive §35). Not yet created as
      a dedicated file; ledger 89's master vertical tracker (§7) is the
      closest existing equivalent and should be promoted/merged into this
      file rather than duplicated.
