# 92 — PHASE 1 + 2 ACCEPTANCE (Landing + Child-Home + World rebuild)

Date: 2026-10-01
Branch: fix/p0-p1-remediation

## What changed (structural, not cosmetic)

**Landing** (`features/landing/pages/LandingPage.tsx`) — rebuilt from the SaaS
marketing skeleton into a world-first experience: warm `brand-soft` canvas (was
`bg-white`), Azouz at hero scale via the new `CharacterStage` with a speech
bubble + the 4 worlds as mentor portals around him, the four domains as colored
world DESTINATIONS with mentors inside (was a flat `.card` grid), the adventure
loop as a numbered path (was 6 equal cards), the companion cast at 96px (was
64px dots). Resolves defects L1–L5.

**Child Home** (`features/dashboard/pages/DashboardPage.tsx`) — rebuilt from
"dashboard with child colours" into a world: `LivingWorldHero` (Azouz + ONE next
action + compact XP ribbon) → `WorldJourneyMap` (4 domains as places on a
journey path, mastery shown as each place's band ring/label — distinct from XP)
→ real engines (interests/review/recommendations/daily-goal) → quiet recent
activity + a single link to `/progress`. Removed from Home: the stat-card grid,
the `CircularProgressbar` level ring, the raw mastery-count panel, and the
10-tile quick-action grid (that analytics now lives on `/progress`). Resolves
defects H1–H5. Zero data loss — every real query still wired.

**New shared components**: `CharacterStage` (hero-scale character + speech),
`WorldJourneyMap` + inline `DomainPortal` (replaces `WorldJourneyStrip`).
**Deleted**: `WorldJourneyStrip.tsx` (§27).
**Hardened**: `DailyGoalCard` now guards a malformed payload (was a latent
hard-crash on an unexpected shape — found via Playwright, fixed defensively).
**i18n**: replaced the stale `landing.*` block in `en.ts` + `ar.ts` (it carried
scope-wrong "math/science/six worlds/four steps" copy that overrode the new
fallbacks) with keys matching the rebuilt structure, EN + real Egyptian-Arabic.

## Evidence

- Gates (all green): `tsc --noEmit` ✓, `eslint --max-warnings 0` ✓,
  `vite build` ✓, `vitest` 40/40 ✓, `check:home-bundle` ✓ (coding runtime
  absent from entry).
- **First-pass visual QA done by engineering (directive §29)** via Playwright
  against the production build, API mocked — 12 full-page captures in
  `frontend/e2e/__screenshots__/` (landing + home × {en, ar} × {desktop,
  tablet, mobile}). Spec: `e2e/visual-rebuild.spec.ts`.
- Captures reviewed by eye. Confirmed: landing reads as a world (portals +
  cast + loop all render), home renders (was crashing pre-fix), RTL mirrors
  correctly (nav/hero/journey/goal all flip, Cairo font, Arabic copy).

## Honest residual gaps (logged, not silently shipped)

These are i18n-completeness gaps in SHARED components carried over from before —
not structural, scoped to a later i18n pass (not this commit):
1. `EmptyState`/`ErrorState` (`components/common/CharacterState`) have hardcoded
   English strings — the "No missions yet / Browse missions" empty state shows
   English even in AR.
2. `WorldJourneyMap` mentor label uses `worldJourney.ledBy` ("with") + the Latin
   mentor name (Luma/Codey/Nova/Adam) — the connector word translates but the
   name stays Latin; acceptable short-term, revisit with character nameAr.
3. Mixed-direction punctuation on "أهلاً يا {name}!" when `name` is Latin — a
   bidi edge, cosmetic.

## Deploy (OWNER-RUN — I cannot reach the server)

```bash
cd ~/USAM-Learning-Worlds
git pull
DEPLOY_BACKEND=0 RUN_TESTS=1 bash scripts/deploy.sh      # frontend-only change
bash scripts/verify-deployment.sh
```
Then eyes-on `https://kids.usamif.com/` (landing, logged-out) and `/dashboard`
(logged-in child), EN + AR, phone/desktop. Backend unchanged this phase, so
`DEPLOY_BACKEND=0` is sufficient.
