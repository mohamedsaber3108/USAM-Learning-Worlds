import { test } from '@playwright/test'

/**
 * Visual QA capture for the Landing + Child-Home experience rebuild
 * (directive §28/§29 — engineering/design does the FIRST visual pass itself,
 * not "only the owner's eyes"). Runs against the production build via
 * `vite preview`, API mocked so no live backend is needed.
 *
 * These are CAPTURE tests (full-page screenshots into e2e/__screenshots__),
 * not pixel-assert regressions — the point is to produce real
 * desktop/tablet/mobile + LTR/RTL images of the rebuilt surfaces for the
 * before/after comparison, without a baseline to diff against yet.
 *
 * Run:  npm run build && npx playwright test visual-rebuild --project=chromium-en
 */

const mockUser = {
  id: 'u1',
  displayName: 'Yousef',
  role: 'LEARNER',
  learner: { id: 'l1', ageBand: 'AGE_10_11' },
}

// A small, valid worlds payload so the WorldJourneyMap renders its 4 places
// (it self-hides on an empty array, which is correct but not what we want to
// photograph). Shapes match WorldRecord.
const worlds = [
  { id: 'w1', name: 'English World', slug: 'english', description: null, order: 1, isActive: true, unlockCondition: null, domain: { id: 'd1', name: 'English', slug: 'english' }, missionCount: 12, isUnlocked: true },
  { id: 'w2', name: 'Coding Lab', slug: 'coding', description: null, order: 2, isActive: true, unlockCondition: null, domain: { id: 'd2', name: 'Coding', slug: 'coding' }, missionCount: 9, isUnlocked: true },
  { id: 'w3', name: 'AI Lab', slug: 'ai-literacy', description: null, order: 3, isActive: true, unlockCondition: null, domain: { id: 'd3', name: 'AI', slug: 'ai-literacy' }, missionCount: 6, isUnlocked: true },
  { id: 'w4', name: 'Startup Studio', slug: 'entrepreneurship', description: null, order: 4, isActive: true, unlockCondition: null, domain: { id: 'd4', name: 'Entrepreneurship', slug: 'entrepreneurship' }, missionCount: 4, isUnlocked: false },
]

const masteryByDomain = [
  { domain: { slug: 'english' }, state: 'PRACTICING' },
  { domain: { slug: 'coding' }, state: 'INTRODUCED' },
  { domain: { slug: 'ai-literacy' }, state: 'MASTERED' },
]

const progression = { level: 4, totalXP: 1280, xpInCurrentLevel: 80, xpForNextLevel: 200, progress: 40 }
const streak = { currentStreak: 5, longestStreak: 9 }

function jsonFor(url: string): unknown {
  if (url.includes('/worlds')) return worlds
  if (url.includes('/mastery/by-domain')) return masteryByDomain
  if (url.includes('/gamification/progression')) return progression
  if (url.includes('/gamification/streak')) return streak
  if (url.includes('/gamification/rank')) return { rank: 7 }
  if (url.includes('/mastery/overview')) return [{ state: 'MASTERED' }, { state: 'PRACTICING' }]
  if (url.includes('/daily-goals') || url.includes('/daily-goal'))
    return {
      goal: { targetMinutes: 20, targetActivities: 3 },
      progress: { minutesSpent: 12, activitiesCompleted: 2 },
      percentComplete: { minutes: 60, activities: 66 },
      goalMet: false,
    }
  if (url.includes('/missions'))
    return [
      { id: 'm1', title: 'Find a Problem Worth Solving', description: 'Spot a real problem around you and describe who it affects.', type: 'GUIDED', estimatedMinutes: 15 },
      { id: 'm2', title: 'Debug the Broken Robot', description: 'Read the code, predict what it does, then fix the bug.', type: 'CHALLENGE', estimatedMinutes: 20 },
      { id: 'm3', title: 'Tell a Story Out Loud', description: 'Practice speaking so a stranger could picture it.', type: 'EXPLORATION', estimatedMinutes: 10 },
      { id: 'm4', title: 'Build Your First Pitch', description: 'Turn your idea into a short, clear pitch.', type: 'PROJECT_BASED', estimatedMinutes: 25 },
    ]
  return []
}

const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'tablet', width: 834, height: 1112 },
  { tag: 'mobile', width: 390, height: 844 },
] as const

// Authed routes to capture beyond Home (Phase 3: Learn + Missions surfaces).
const AUTHED_ROUTES: { tag: string; path: string }[] = [
  { tag: 'worlds', path: '/worlds' },
  { tag: 'missions', path: '/missions' },
]

for (const lang of ['en', 'ar'] as const) {
  for (const vp of VIEWPORTS) {
    test(`capture landing ${lang} ${vp.tag}`, async ({ page }) => {
      await page.addInitScript((l) => localStorage.setItem('usam.language', l), lang)
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForTimeout(900) // let hero spring + fonts settle
      await page.screenshot({ path: `e2e/__screenshots__/landing-${lang}-${vp.tag}.png`, fullPage: true })
    })

    test(`capture home ${lang} ${vp.tag}`, async ({ page }) => {
      await page.addInitScript((args) => {
        const [user, l] = args as [unknown, string]
        localStorage.setItem('accessToken', 'e2e-token')
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('usam.language', l)
      }, [mockUser, lang])
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(jsonFor(route.request().url())),
        })
      })
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/dashboard')
      await page.waitForTimeout(1100)
      await page.screenshot({ path: `e2e/__screenshots__/home-${lang}-${vp.tag}.png`, fullPage: true })
    })

    for (const route of AUTHED_ROUTES) {
      test(`capture ${route.tag} ${lang} ${vp.tag}`, async ({ page }) => {
        await page.addInitScript((args) => {
          const [user, l] = args as [unknown, string]
          localStorage.setItem('accessToken', 'e2e-token')
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('usam.language', l)
        }, [mockUser, lang])
        await page.route('**/api/**', (r) => {
          r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(jsonFor(r.request().url())),
          })
        })
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(route.path)
        await page.waitForTimeout(1000)
        await page.screenshot({ path: `e2e/__screenshots__/${route.tag}-${lang}-${vp.tag}.png`, fullPage: true })
      })
    }
  }
}
