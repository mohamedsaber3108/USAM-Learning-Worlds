# 01 — USAM for Kids: Master Reconstruction Plan

Companion to `00_MASTER_AUDIT.md`. This is the decision + sequencing plan the
mandate requires before implementation. It resolves contradictions, sets the
architecture, and defines the dependency-ordered execution slices.

---

## 1. Reconstruction decision (mandate §04, §28, §40)

**Rebuild the PRESENTATION + EXPERIENCE layer on the existing verified skeleton.**
Delete/rewrite bad UI freely; preserve the correct data layer, routing contracts,
i18n/RTL, age-adaptation, character system, and backend integration.

**Rejected: rebuild-from-zero.** The audit proved a correct, backend-connected
58-page app on healthy git history. The mandate's own hard constraints — zero
feature loss, no fake flows, reflect the real backend, keep the branch
deployable (Lovable rule) — are *violated* by retyping it from scratch (that
guarantees temporary feature loss + broken flows). Highest product quality =
aggressively rebuild what's weak (layouts, home, world/mission/project flows,
un-surfaced engines) on the proven foundation.

## 2. Contradiction resolutions (mandate §30)

| Contradiction | Resolution | Authority |
|---|---|---|
| Old MVP spec "keep it simple" vs new "final product, not MVP" | Final-product standard wins; MVP spec is historical reference | §05 (newer) |
| "Rebuild from zero" (§40) vs "zero feature loss + deployable" (§13, Lovable rule) | Presentation rebuild on skeleton — the only reading that satisfies BOTH | §13 constraint is non-negotiable |
| Sub-agent "double-prefix API bug" vs verified single-prefix | Verified real backend single-prefix; no bug | Direct file read |
| Two worktrees | `M:\USAM-main` is canonical; old `main` orphaned, never pushed | Git merge-base = none |
| Switch component lib (Radix/shadcn) vs existing token system | Keep existing token/primitive system (works, owned, RTL-aware); adopt Radix ONLY as headless a11y layer for complex widgets (dialog/menu/tabs) if/when needed | §08 "don't switch prod lib without cost analysis" |

## 3. Final information architecture (mandate §12)

Primary nav (floating pill, age-adaptive): **Home · Learn · Missions · Create ·
Progress · Profile**, with More drawer for Characters/Stories/English/Coding/
Community/Shop/Voice/Insights. Parent + Admin are role-gated separate shells.
Keep all 58 routes; regroup nav labels around learner mental model
(Where am I / What next / What did I make / How am I doing).

## 4. Age-adaptive strategy (mandate §09) — already partly real

Extend `useAgeAdaptation` (currently density/vocabulary/cardCount/copyTone) to
also drive: nav item set, character prominence, activity chrome. AGE_8_9 =
visual-first big targets + strong character; AGE_10_11 = balanced; AGE_12_14 =
autonomy + portfolio/entrepreneurship surfaced.

## 5. Dependency-ordered execution slices (mandate §35)

Each slice = a complete, tested, deployable increment (keeps branch green):

1. **Design-system hardening** — finalize tokens/primitives, add missing states
   (locked/first-time/offline) to `CharacterState`/`Skeleton`. ✅ largely done.
2. **Shell + nav IA** — floating pill nav ✅; regroup labels; age-adaptive nav set.
3. **Home as a living world** — rebuild dashboard into a "world hub" (continue,
   next recommendation from `adaptiveApi`, world tiles, character greeting).
4. **World / Mission flow** — mission browse→detail→player→complete as a real
   story→learn→practice→mastery→reward journey.
5. **Learn hub** — curriculum/paths/concepts/flashcards unified under one clear IA.
6. **English engine surface** — strands + coach + (surface listening/speaking).
7. **Create** — projects + creativity + coding unified.
8. **Characters + AI + Voice** — gallery, chat, contextual companion states.
9. **Progress + Gamification** — progress/mastery/achievements/leaderboard/shop.
10. **Surface un-exposed engines** — adaptive recommendations, worlds,
    notifications, reflection, credentials, simulation (each gets a real UX).
11. **Parent + Safety** — dashboard, time-limits, reporting.
12. **QA passes** — visual, UX, a11y, responsive, RTL, per slice.

## 6. Per-slice acceptance (mandate §28, §34)

Each slice ships only when: builds green (`tsc && vite`), tests pass
(`vitest run`), eslint clean, every touched page has loading/empty/error/success
states, real API wired (no fake data), responsive + RTL checked, committed +
pushed to `fix/p0-p1-remediation`.

## 7. Open-source stack decision (mandate §21–22)

KEEP: React/Vite/TS, react-router, @tanstack/react-query, framer-motion,
tailwind, lucide, react-i18next, react-circular-progressbar, Sandpack/CodeMirror
(coding), Pyodide (python). EVALUATE (only if a slice needs it): Radix primitives
(headless a11y for dialog/menu/tabs), Rive/Lottie (richer character states).
REJECT for now: swapping the whole UI lib; Phaser/Three (no current game surface
that justifies the weight). Every future add needs a KEEP/USE/CUSTOMIZE/REJECT
line.

## 8. What this plan explicitly does NOT do

- Does not push orphaned `main`.
- Does not delete working backend integrations.
- Does not introduce fake/placeholder production data.
- Does not claim live-device or live-product visual QA I can't perform — visual
  QA is done via build + the user's screenshots.

## 9. Immediate next action

Begin **Slice 3 (Home as a living world)** — highest visible impact — but only
after the user confirms a screenshot so the rebuild is grounded, per the
verification principle. Remaining plan sub-docs (02–16) authored per slice as it
is executed, not as upfront stubs.
