import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E config (task #16) — OPT-IN.
 *
 * NOT wired into the deploy gate: it needs the Playwright package + browser
 * binaries, which the deploy server may not have. To run locally / in a
 * dedicated CI job:
 *
 *   npm i -D @playwright/test
 *   npx playwright install --with-deps chromium
 *   npm run build
 *   npm run e2e
 *
 * The tests run against the PRODUCTION build served by `vite preview` (port
 * 4173) and mock the /api/* surface (see e2e/fixtures) so they need no live
 * backend — they verify the deployed frontend's real routing, rendering, and
 * bundle behavior (e.g. Home does not download the coding runtime).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  // Build first (npm run build), then this serves dist/ on :4173.
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    // Core journeys — desktop Chromium, English (LTR).
    { name: 'chromium-en', use: { ...devices['Desktop Chrome'] } },
    // Arabic-first RTL + mobile viewport (age-adaptive / responsive coverage).
    {
      name: 'mobile-ar',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
