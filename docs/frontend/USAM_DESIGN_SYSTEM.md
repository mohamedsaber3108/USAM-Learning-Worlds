# USAM Kids — Design System (rebuild)

> Reference Bible §4/§34. A **USAM design system**, not a default library theme.
> Tokens are grounded in the verified current palette (`frontend/tailwind.config.js`)
> which is kept; the *component architecture, motion, character integration,
> responsive and RTL rules* are defined here as the rebuild standard.

Date: 2026-09-23

---

## 1. Layer decisions (Bible §4 mandatory output)
| Layer | Choice | Note |
| --- | --- | --- |
| Primitive / accessibility | **Radix UI** (React Aria for complex cases) | keyboard/focus/ARIA correctness; introduced incrementally |
| Styling / tokens | **Tailwind + `styles/index.css` token layer** | kept |
| Component ownership | **shadcn-style owned components** (copy-in, on Radix+Tailwind) | full control of child-first look |
| Icons | **Lucide** | kept |
| Motion | **framer-motion**; **Rive/Lottie** for characters (POC) | reduced-motion respected |
| Forms | **react-hook-form + zod** | kept |
| State | **TanStack Query** (server) + **Zustand** (local) | kept |
| Responsive | Tailwind breakpoints + age-adaptive layout | see §6 |
| RTL | `dir`/`lang` on `<html>` + Tailwind `rtl:` variants | real mirror, kept |

## 2. Color tokens (from `tailwind.config.js` — canonical)
- **Primary — deep teal** (dominant brand): `500 #2b7061 · 600 #1c5a4d · 700 #12403a` (+ 50–900 scale).
- **Accent — warm terracotta** (sparing CTAs/streaks): `500 #d96a2c`.
- **Secondary — honey gold** (XP/rewards only): `500 #cf9316`.
- **Success — emerald** (correct/mastery): `500 #10b981`.
- **Warning · Error · Surface** (canvas/neutrals). Playful **sky/grape/bubble** accent scales for worlds/characters.
- **`brand-hero` gradient:** `linear-gradient(135deg,#12403a,#1c5a4d,#2b7061)`.
- Semantic usage rule: teal = brand/structure; gold = reward; terracotta = single warm CTA; emerald = correctness. Do not rainbow.

## 3. Typography
- **Display/Heading:** Nunito (fallback Manrope) — warm rounded sans.
- Scale is age-adaptive (see §6): larger base + heading sizes for 7–9.

## 4. Component inventory (owned components to build/keep)
Buttons (`btn-primary/secondary/accent/outline/hero`), Card, IconChip, inputs/forms,
Nav (age-adaptive shell), Modal/Dialog (Radix), Dropdown/Menu (Radix), Tabs (Radix),
Badge, Table (parent/admin), Alert, Toast, **CharacterState** (loading/empty/error with a companion — keep), Skeleton, CelebrationOverlay, CharacterFace/Avatar, ProgressRing, WorldMap, MissionStepper, FeedbackBanner, LearnStep, CodingCoachPanel. Rounded tokens: `rounded-pill/card/blob/control`. Shadows: `shadow-soft/lift/glow-success/error`.

## 5. Motion / character integration (Bible §5/§14/§36)
- Character states: idle/speaking/listening/thinking (Rive state machine POC; fallback to programmatic face).
- Motion budget: celebratory + guidance motion only; **`prefers-reduced-motion` disables non-essential motion**.
- Character loop wiring: `Learner Context → Mission/Activity → Character Orchestrator → AI/Voice → Safety → Feedback → Learning State` (must be real in code, not decorative).

## 6. Age-adaptive responsive rules (the core of the rebuild)
Driven by `useAgeAdaptation(ageBand)`:
| | 7–9 | 10–12 | 13–15 |
| --- | --- | --- | --- |
| Base font | largest | large | standard |
| Tap target min | 56px | 48px | 44px (WCAG) |
| Cards visible | fewest (`maxVisibleCards`) | more | most |
| Text density | minimal + voice | moderate | full |
| Nav | iconic bottom bar | + worlds/projects | full + search |
Breakpoints: mobile-first; tablet is a first-class layout (kids use tablets heavily); desktop for parents/admin.

## 7. Accessibility rules (Bible §3, WCAG)
- Skip-to-content (shipped), landmarks, focus-visible, ARIA via Radix.
- Color-contrast AA min; never color-only signaling.
- Every interactive element keyboard-reachable; axe gate in tests.
- Reduced-motion honored. RTL fully mirrored.
- Full WCAG conformance requires manual AT testing + expert review (stated, not faked).

## 8. States (every page)
loading (companion skeleton) · empty (companion + next action) · error (companion + retry) · offline (where relevant, e.g. project workspace). No blank screens; no dead ends.

## 9. i18n / RTL (Bible §30)
No hardcoded strings or direction in components. EN + AR (Egyptian-Arabic conversational
tone for child-facing copy). Voice locale separate from UI locale.
