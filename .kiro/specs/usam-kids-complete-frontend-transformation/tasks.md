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

- [x] Mission Brief (`MissionDetailPage.tsx`) real-gap fix: `GET /missions/
      :id` already returns real `type` (MissionType enum) and real
      `activities[]` (each with real objective + competency name),
      confirmed via a direct authenticated API call against production —
      the frontend's `Mission` type only declared id/title/description/
      estimatedMinutes and discarded the rest. Added mission-type pill,
      real activity count, and a real "you'll practice" skill list (unique
      competency names) before the learner starts. Zero fabricated content
      — no story/context or pre-completion reward exist on the real
      `Mission` Prisma model, so those directive §18 asks are NOT shown
      (would require a new backend contract; not invented).
- [x] `WorldDetailPage.tsx` node vocabulary (directive §11/§12): confirmed
      the real backend only distinguishes 4 statuses (COMPLETED/
      IN_PROGRESS/AVAILABLE/LOCKED) — richer vocabulary (project/practice/
      story/simulation/challenge/reward node types) is NOT backed by a
      real field and was not fabricated. What WAS real but undeclared:
      `type` (MissionType) and `estimatedMinutes` are present on every
      mission inside `GET /worlds/:id` (full Prisma row spread) but
      `WorldMission` never typed them — added both as a per-row subtitle.
      Also added a derived (not fabricated) "Up next" highlight: the first
      IN_PROGRESS, else first AVAILABLE, mission in the real sequence —
      pure client-side derivation from already-real per-mission status,
      answering directive §11's "CURRENT LOCATION"/"NEXT" ask honestly.
- [x] Mission Player completion — confirmed via code read: the `thinking`-
      state fix (this batch) only touched the `companionState` computation;
      the completion outcome, mastery-impact filter (ledger 89 §2.18), and
      next-step-link logic (§2.17) are untouched and still intact. No
      regression. "No dead end" (directive §19) still holds.

## Batch 1 note (2026-10-22)

Decision A's strict "no per-feature hue" rule was explicitly loosened by
the owner — see `design.md`'s 2026-10-22 update. Restrained per-world
accent tints, richer composition, depth, and motion are now in scope.
The scraped-reference carve-out (§0.1 of `requirements.md`) was
reaffirmed, not loosened, after being explicitly re-challenged three times
in owner messages — see `design.md` for the standing reasoning.

## Batch 3 — Practice/Progress/Rewards

- [x] (ledger 89 §2.25) Rewards achievements real-shape bug fixed —
      backend's 18-milestone system was silently unreachable from the UI.
- [x] Practice — real gap found and closed: the backend's Adaptive module
      has 10 real engines (`adaptive.controller.ts`) with essentially zero
      frontend usage (only `getRecommendations` was wired, on HomePage).
      Added a third Practice tab, "Recommended", backed by the real
      Interleaving Engine (`GET /adaptive/interleaved-practice`) — a
      genuine competency-alternating practice set mixing real review-due
      and struggling-focus competencies. Each item links into the
      learner's real path (same `competencyId -> domainSlug`
      cross-reference pattern as the review-due dead-end fix), not a dead
      end. The other 9 adaptive endpoints (cognitive-load, zpd,
      growth-velocity, transfer-opportunities, engagement, difficulty,
      should-level-up, learning-path, next-activity) remain real but
      unused — flagged, not silently dropped; wiring them needs dedicated
      UI decisions (e.g. where does "cognitive load" surface to a child
      without raw metrics) that weren't forced to avoid fabricating UI
      around them.
- [x] Progress/Mastery audited — clean, no fix needed. `masteryLabel()`
      already maps every real `MasteryState` to a child-language label
      (New/Just started/Exploring/Practicing/Getting stronger/Strong/
      Mastered); no raw enum or confidence decimal is ever rendered.
      Considered adding a distinct "review needed" indicator per
      competency row, but the backend already owns that due-date
      determination server-side and Practice's Review tab is the
      dedicated surface for it — duplicating the comparison client-side
      would risk drifting from the backend's own logic for marginal
      value, so intentionally not added.

## Batch 3 complete

## Batch 5 — Smart Practice (adaptive vertical slice)

Adaptive-engine frontend classification (directive §5) — all 11 real
`/adaptive/*` endpoints classified:
- `next-activity` (orchestrated) → LEARNER_SURFACE — now wired as Smart
  Practice lead card.
- `interleaved-practice` → LEARNER_SURFACE — wired (Recommended tab, Batch 3).
- `recommendations` → LEARNER_SURFACE — already wired (HomePage).
- `engagement`, `cognitive-load`, `growth-velocity`, `zpd`,
  `should-level-up` → BACKGROUND_ENGINE / INTERNAL_ONLY — diagnostic
  signals; the directive explicitly forbids child-facing engine
  dashboards, and these expose confidence/fatigue/velocity metrics that
  violate the child-language rule. Not surfaced to learners (candidates
  for a future Guardian/Admin analytics view only).
- `transfer-opportunities`, `learning-path`, `difficulty`,
  `next-activity/:competencyId` → CONTEXTUAL_PRODUCT_ACTION — real but
  need a specific host surface; not forced.

- [x] Smart Practice lead card on `PracticePage.tsx`, backed by real `GET
      /adaptive/next-activity` (orchestrated ZPD→competency→difficulty→
      activity chain). Surfaces only structured fields (competency name +
      child-framed difficulty label), never the backend's jargon-laden
      `reason` string. Routes to the learner's real domain path via the
      proven `competencyId → domainSlug` resolution (lands on a startable
      mission) — no invented raw-activity launch flow. Honest empty state
      (card hidden) when the engine has nothing to recommend yet.

## Batch 4 — English/Coding/AI Literacy/Creativity/Thinking

- [x] English audited: `EnglishCoachPage.tsx` already had 4 real tabs
      (conversation/grammar/vocabulary/reading), all backed by real
      `english-coach.controller.ts` endpoints. Found one real gap: `POST
      /english-coach/pronunciation` had zero frontend caller. Its response
      has a real part (AI-generated phonetic breakdown/syllable-stress/
      memory-trick feedback) and a backend-acknowledged fake part
      (`pronunciationScore` — hardcoded 0.85 placeholder pending a real
      STT+phoneme pipeline, confirmed via the service's own comment).
      Added a 5th "Pronunciation" tab that deliberately never sends a
      `transcript`, so the placeholder score is never produced or
      rendered — only the genuinely real coaching text is shown, honestly
      framed as written tips, not a measured score.
- [x] Coding audited: `CodingActivityPanel.tsx` already uses the real
      client-exec/server-revalidate loop and has real "Ask Codey" (debug)
      + "Review my code" (review) coaching. Of the 4 real `coding-coach`
      endpoints (debug/review/explain/challenge), `explain` had a typed
      wrapper but zero caller — closed it: added an "Explain this code"
      learner-initiated action (available any time, incl. before first
      run) so a child can ask Codey to walk through code they don't yet
      understand. Stale explanation clears on edit. `challenge`
      (generate-a-challenge) remains unused — a real candidate for a
      future Skill/World Challenge feature (directive §13), flagged not
      forced, since it needs a conceptId source + a home surface that
      doesn't exist yet.
- [ ] AI Literacy/Creativity/Thinking — not yet audited this batch.

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
