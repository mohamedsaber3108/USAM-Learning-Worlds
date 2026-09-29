import { test, expect } from '@playwright/test'

/**
 * Home smoke + perf journey (task #16).
 *
 * Runs against the production build (vite preview). The /api/* surface is
 * mocked so no live backend is needed — this is a FRONTEND deployment check:
 * real routing + render + the key performance guarantee that Home does not
 * download the coding runtime.
 */

// Minimal mock so the authenticated Home renders without a live backend.
const mockUser = {
  id: 'u1',
  displayName: 'Test Learner',
  role: 'LEARNER',
  learner: { id: 'l1', ageBand: 'AGE_10_11' },
}

test.beforeEach(async ({ page }) => {
  // Pretend we're signed in (RootRoute/ProtectedRoute read localStorage).
  await page.addInitScript((user) => {
    localStorage.setItem('accessToken', 'e2e-token')
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('usam.language', 'en')
  }, mockUser)

  // Mock every API call with an empty-but-valid shape so queries settle into
  // honest empty states rather than spinners.
  await page.route('**/api/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
})

test('Home renders and does NOT download the coding runtime', async ({ page }) => {
  const codingChunks: string[] = []
  page.on('request', (req) => {
    const url = req.url()
    if (/vendor-(sandpack|codemirror|pyodide)/.test(url)) codingChunks.push(url)
  })

  await page.goto('/dashboard')

  // Home mounted (the app shell's main content region is present). Use the
  // stable #main-content id — there can be a transient loading-skeleton <main>
  // too, so a bare `main` locator is ambiguous.
  await expect(page.locator('#main-content')).toBeVisible()

  // The core performance guarantee: no coding-runtime chunk fetched on Home.
  expect(
    codingChunks,
    `coding runtime should not load on Home, but fetched:\n${codingChunks.join('\n')}`,
  ).toHaveLength(0)
})

test('Arabic toggle flips document direction to RTL', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('usam.language', 'ar'))
  await page.goto('/dashboard')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
})
