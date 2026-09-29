# Frontend E2E (Playwright) — opt-in

These tests exercise the **production build** of the canonical frontend
(`frontend/`) served by `vite preview`, with the `/api/*` surface mocked so no
live backend is required. They verify the deployed frontend's real routing,
rendering, i18n/RTL, and bundle behavior.

## Why opt-in (not a deploy gate)

Playwright needs its npm package + downloaded browser binaries (~hundreds of
MB). The deploy server may not have them, and adding `@playwright/test` to
`package.json` would change the lockfile that `npm ci` verifies during deploy.
So E2E is intentionally **not** in `scripts/deploy.sh`. The cheap, deterministic
perf assertion that *is* gated is `npm run check:home-bundle` (Home must not
eagerly load the coding runtime).

## Run

```bash
cd frontend
npm i -D @playwright/test
npx playwright install --with-deps chromium
npm run build
npm run e2e            # add to package.json: "e2e": "playwright test"
```

## Core journeys covered

- `home.spec.ts` — Home renders (companion + next action), and the Home network
  trace does NOT fetch the coding runtime chunks (sandpack/codemirror/pyodide).
- Extend with: onboarding age-select shows 7-9/10-12/13-15; Practice/Evidence
  routes render; Arabic toggle flips `dir="rtl"`.

## Multi-device / age / language QA

The `mobile-ar` Playwright project covers Arabic RTL on a phone viewport.
Full human visual QA across the three age bands (7-9/10-12/13-15) and
phone/tablet/desktop is a manual pass to run in a real environment — tracked in
the acceptance report as pending.
