# 81 — Visual QA Matrix (new frontend rebuild)

> Real browser QA is mandatory (not tsc/build/unit tests). Every major route ×
> role × language (EN/AR) × viewport × state must be checked in a real browser.
> This workspace has NO live backend/browser env — QA rows are executed by the
> owner (server + browser) and pasted back; automated route-render + a11y are
> run here where possible. `Checked?` stays `no` until a real pass.

Viewports: `360` (phone), `768` (tablet), `1024`+ (desktop). Languages: EN (LTR),
AR (RTL). States per surface from the page/flow inventory.

## Public + Auth + Onboarding (task 9)

| Route | Role | Lang | Viewport | States to check | Checked? | Issues | Fix commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` Landing | Public | EN/AR | 360/768/1024 | READY, hero legible, CTAs, lang toggle, RTL mirror | no | | |
| `/pricing` | Public | EN/AR | 360/768/1024 | LOADING, READY(real plans), EMPTY, ERROR+retry | no | | |
| `/login` | Public | EN/AR | 360/768/1024 | READY, ERROR(bad creds), loading, focus order, RTL | no | | |
| `/signup` | Public | EN/AR | 360/768/1024 | role toggle, validation, 409 email-taken, SUCCESS→route | no | | |
| `/onboarding` | LEARNER | EN/AR | 360/768/1024 | age step→save, interests step→save, ERROR, progress bar RTL | no | | |

## Learner / Parent / Moderator / Admin (tasks 10–11)

Rows added as surfaces are built. Each route from FINAL_ROUTE_REGISTRY gets a
row per language with its state set.

## Automated checks runnable in this workspace (no live backend)

- `tsc -b --noEmit` clean ✅ (task 8, 9)
- `vite build` clean ✅ (task 8: 182 modules; task 9: 186 modules)
- Route-render smoke + axe a11y: TODO (add vitest + jsdom render tests that
  mount each route with a mocked API boundary — mocks allowed in TESTS only).
- RTL document check: `<html dir="rtl">` applied on AR (i18n applyDocumentDirection).

## Regression-compare vs 1ae4dcd (legacy functional baseline)

For each rebuilt surface, confirm the new experience preserves the proven
behavior of the legacy route it replaces (see 79 audit). Owner-run side-by-side
where a live backend is needed (auth, real data). Behaviors to preserve are
listed in 79 ("Key regressions the new FE MUST preserve").
