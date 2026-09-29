import { test, expect } from '@playwright/test'

/**
 * Critical-route render smoke (task #16, directive #2).
 *
 * Runs against the production build (vite preview). No live USAM backend is
 * available in the dev workspace, so `/api/**` is mocked at the boundary with
 * empty-but-valid responses — this verifies the deployed FRONTEND's real
 * routing, mounting, i18n, RTL and honest empty/loading/error states (frontend
 * truth). Real-data round-trips (submit → evidence → mastery → review) require
 * a live backend and are the owner's live-verification pass — see
 * plans-local/78 and e2e/README.md.
 */

const mockUser = {
  id: 'u1',
  displayName: 'Test Learner',
  role: 'LEARNER',
  learner: { id: 'l1', ageBand: 'AGE_10_11' },
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('accessToken', 'e2e-token')
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('usam.language', 'en')
  }, mockUser)
  // Mock the API boundary only. Empty arrays/objects settle queries into honest
  // empty states rather than spinners; never mock frontend logic.
  await page.route('**/api/**', (route) => {
    const url = route.request().url()
    // A few endpoints expect an object, not an array.
    const objectish = /\/(overview|by-domain|me|dashboard|progression|streak|rank|progress)\b/.test(url)
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: objectish ? '{}' : '[]',
    })
  })
})

// Each canonical learner route must mount its shell without a crash/blank.
const CHILD_ROUTES: Array<{ path: string; name: string }> = [
  { path: '/dashboard', name: 'Home' },
  { path: '/practice', name: 'Practice' },
  { path: '/evidence', name: 'Evidence' },
  { path: '/missions', name: 'Missions' },
  { path: '/english', name: 'English' },
  { path: '/coding', name: 'Coding' },
  { path: '/learning/domains/coding/path', name: 'Coding path' },
  { path: '/learning/domains/english/path', name: 'English path' },
  { path: '/cross-curricular/ai-literacy', name: 'AI Literacy' },
  { path: '/creativity', name: 'Creativity' },
  { path: '/projects', name: 'Projects' },
  { path: '/portfolio', name: 'Portfolio' },
]

for (const r of CHILD_ROUTES) {
  test(`route renders: ${r.name} (${r.path})`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    await page.goto(r.path)
    // The app shell main region mounts on every authed route.
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })
    expect(errors, `uncaught page errors on ${r.path}:\n${errors.join('\n')}`).toHaveLength(0)
  })
}

test('unknown route falls back to dashboard (no blank screen)', async ({ page }) => {
  await page.goto('/definitely-not-a-real-route-xyz')
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })
})

test('Arabic RTL applies across a child route', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('usam.language', 'ar'))
  await page.goto('/practice')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })
})
