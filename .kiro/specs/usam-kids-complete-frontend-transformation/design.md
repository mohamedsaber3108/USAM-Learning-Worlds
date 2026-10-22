# USAM Kids — Complete Frontend Transformation: Design

## Audited current state (verified by reading real files, not assumed)

- **Design tokens**: `frontend/tailwind.config.js` + `docs/frontend/
  FINAL_USAM_DESIGN_SYSTEM.md`. Real, deliberate, documented decision:
  brand green (10-step ramp), near-black ink ramp, white/off-white canvas,
  functional-only semantic colors, whisper shadows (`soft`/`card`/`lift`/
  `focus`), radius scale (`control`/`card`/`pill`), 4 duration tokens
  (`xfast`/`fast`/`base`/`slow`) + 2 keyframes (`fade-in-up`,
  `pulse-soft`). This replaced an earlier "rainbow" per-feature-hue legacy
  system on purpose ("Decision A").
- **Component library**: `frontend/src/components/ui/` — Badge, Button,
  Card, Display (Avatar/StatusPill/Stepper), Field, Overlay, Toast. Small,
  real, reused consistently (confirmed via grep across ~25 feature pages
  this session).
- **Character system**: `frontend/src/features/characters/` —
  `CharacterFace.tsx` (15 bespoke SVG character designs: azouz, zein, luma,
  codey, nova, mira, rami, faris, tala, adam, byte, nour, rex, zara, atlas
  — matching the real seeded backend roster) with a real framer-motion
  state machine (idle/listening/thinking/speaking/encouraging/celebrating/
  error), blink-stagger, and a 5-stage evolution glow tied to real
  `relationshipLevel`. `CharacterStage.tsx` composes it at hero scale with
  an optional speech bubble. This is a genuinely strong existing asset —
  treat as foundation to extend contextually, not replace.
- **App shell**: `frontend/src/components/layout/AppShell.tsx` — real,
  role-aware nav (LEARNER/GUARDIAN/MODERATOR/ADMIN), mobile bottom tab bar
  + desktop top nav, real unread-notification badge, language toggle,
  profile menu. The `/app/more` hub (prior session) already solved the
  "12 real pages with no nav entry" gap.
- **i18n**: `frontend/src/lib/i18n/locales/{en,ar}.ts` — flat key maps,
  parallel EN/AR, `dir`-aware CSS (`html[dir='rtl'] body { @apply
  font-arabic }`).

## Resolving the "visual environments vs. Decision A" tension

The directive asks for distinct per-domain "visual environments" (English =
language world, Coding = tech lab, AI = laboratory, Creativity = studio).
Decision A explicitly forbids per-feature color ownership. Resolution:
express domain identity through **composition + iconography + character +
motion**, not hue:

- Each world/domain keeps the shared brand-green/ink/white token system.
- Domain identity comes from: the domain's existing icon
  (`DOMAIN_ICON` map in `LearnPage.tsx`), its assigned companion character
  (`DOMAIN_COMPANION`), domain-specific illustrative motifs rendered in SVG
  (e.g. Coding's existing bracket/circuit motif in Codey's design), and
  layout/density differences appropriate to the activity type (e.g. Coding
  needs an editor-first layout; Stories needs a scene-first layout).
- A single, restrained "world accent" token MAY be introduced later as a
  low-saturation tint (not a full hue family) applied to a world's hero
  surface only, if a future batch demonstrates it's needed for wayfinding
  — not assumed up front.

This is the implementation interpretation of directive §7/§8 within the
existing architecture, not a silent reversal of it.

## Motion system (extends the existing token set, same file)

Existing: `fade-in-up`, `pulse-soft` keyframes; `xfast/fast/base/slow`
durations; `out-expo` easing.

To add as concrete triggers are wired (not speculatively): a `shimmer`
keyframe for mastery/progress-value changes, a `wobble` keyframe for the
existing `error` character state's "gentle shake" (currently inline
framer-motion in `CharacterFace.tsx` — promote to a shared token only once
a second consumer needs the same curve), and reward-unlock/node-unlock
motion once a real "world unlock" UI moment exists to attach it to (today,
`completeMission` doesn't return an unlock-diff — see ledger 89 §2.18 — so
this motion has no real trigger yet; building it speculatively would be
decorative-only, which the directive itself prohibits in §38: "integrated
into real functional components, not merely decorative demos").

## Character-state integration policy

Use the real existing 7-state machine contextually; do not add new states
without a concrete, real UI trigger. Round 1 of this spec closed one real
gap: `MissionPlayerPage.tsx` now shows `thinking` while an answer is being
graded (`submitting === true`), reusing the existing state — previously sat
in `idle` with no feedback that grading was happening.

## Batch architecture

Same cadence as ledger 89 (implement → tsc → lint → vitest → build →
check:home-bundle → commit → push → owner deploy → independent live
bundle-marker verification), applied per the directive's own batch list
(§46), re-ordered to match actual audited priority:

1. Shell/tokens/character-state audit (this spec's bootstrap batch)
2. Learn/Worlds/Mission Detail/Mission Player depth
3. Practice/Progress/Rewards
4. English/Coding/AI Literacy/Creativity/Thinking
5. Stories/Simulations/Projects/Portfolio
6. Voice architecture (provider-independent scaffolding only — runtime
   stays honestly gated, per ledger 89's existing `BLOCKED_EXTERNAL`
   disposition until a provider exists)
7. Search/Notifications/Settings
8. Guardian/Moderator/Admin
9. RTL/responsive/a11y/performance pass
10. Landing/Auth/Onboarding re-evaluation

Batches are not strictly sequential — real gaps found while working one
batch (e.g. the Rewards achievements bug found while auditing locked-state
messaging) are fixed immediately, same as this session's established
practice, and logged in whichever tracking doc is most specific (ledger 89
for already-underway verticals; `tasks.md` for net-new batch work).
