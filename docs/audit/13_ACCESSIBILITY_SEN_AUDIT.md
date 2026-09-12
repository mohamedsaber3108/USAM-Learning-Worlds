# 13 — Accessibility & SEN Audit

**Baseline:** `origin/main @ 3a787c0`. Evidence from frontend audit. Full WCAG conformance requires manual assistive-technology testing + expert review (not done here).

## Findings

| ID | Status | Evidence |
|---|---|---|
| USAM-A11Y-001 | **PARTIALLY_IMPLEMENTED** | Real aria usage across ~27 files; `aria-current`, `aria-haspopup`/`aria-expanded`, `role="dialog"`, decorative-logo `aria-hidden`, `role="status" aria-live="polite"` on loading/error states, `focus-visible:ring` focus rings, `<main>` landmark on ~34 pages, RTL-aware classes |
| — gaps | | **No dialog focus-trap** (More drawer/modals); `prefers-reduced-motion` gated in only 3 files despite pervasive framer-motion; labels not always `htmlFor`-associated; `SkipLinks` component exists in the deprecated root app, not confirmed wired into `frontend/` AppShell |
| USAM-A11Y-002 (SEN) | **REQUIRES_RESEARCH** | no dyslexia-friendly typography toggle, ADHD-friendly patterns, font scaling controls, captions, or SEN adaptations found; must be designed without diagnosing children |
| USAM-A11Y-003 | **MISSING** | no automated a11y testing (axe-core/pa11y) in CI |

## Actions (roadmap)

1. P1 — Add dialog focus-trap + complete `prefers-reduced-motion` gating; associate all labels; wire SkipLinks into `frontend/` AppShell.
2. P1 — Add axe-core to the (to-be-created) frontend test suite + a11y CI gate.
3. P2 — SEN adaptation research track (dyslexia font, reduced-density mode, captions, font scaling) — design-led, evidence-based.
