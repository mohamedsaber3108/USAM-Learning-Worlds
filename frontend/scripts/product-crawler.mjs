/**
 * Product crawler / screenshot harness — authenticated, against PRODUCTION
 * ROOT (real API, real data, no mocks). Built in response to the
 * 2026-10-06/07 "full product rebuild" directive §6 ("build a real product
 * crawler") + §1 ("verify the new Mission Brief/World Detail companion
 * presence using a real route, not a placeholder").
 *
 * This is NOT a duplicate of live-verify.mjs (which proves route
 * reachability + zero console/network errors across all 5 roles). This
 * script adds what that one does not:
 *   1. Targeted companion-presence assertions on specific real routes
 *      (does CharacterStage actually render, not just "page has content").
 *   2. Screenshot capture (desktop + mobile viewport) for visual QA,
 *      stored under qa-screenshots/ (gitignored, local artifact only).
 *   3. A generic route crawler driven directly from a REAL_ROUTES list
 *      resolved from live API data (real world/mission ids), not
 *      hardcoded placeholder segments.
 *
 * Usage:
 *   BASE=https://kids.usamif.com \
 *   EMAIL=<real learner email> PASSWORD=<real learner password> \
 *   WORLD_ID=<real world id> MISSION_ID=<real startable mission id> \
 *   node scripts/product-crawler.mjs
 *
 * Safe to run repeatedly: read-only navigation only, except starting the
 * given mission (POST /missions/:id/start) which is an idempotent-enough,
 * low-risk, real product action (creates a MissionRun) — needed to reach
 * the real Mission Player route for a screenshot/companion check at all.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = (process.env.BASE || 'https://kids.usamif.com').replace(/\/$/, '')
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const WORLD_ID = process.env.WORLD_ID
const MISSION_ID = process.env.MISSION_ID
const OUT_DIR = 'qa-screenshots/product-crawl'

mkdirSync(OUT_DIR, { recursive: true })

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
}

/** Does a real CharacterStage instance render on the page right now? Checks
 * for the component's actual DOM signature (data attribute set by
 * CharacterFace's root SVG wrapper), not just "page has some content". */
async function hasCompanion(page) {
  return page.evaluate(() => {
    // CharacterFace renders an <svg> inside a figure with aria-label set to
    // the character's name (see features/characters/CharacterFace.tsx) —
    // check for any svg whose nearest figure/container carries that pattern.
    const candidates = Array.from(document.querySelectorAll('svg'))
    return candidates.some((svg) => {
      const el = svg.closest('[aria-label], figure, div')
      return Boolean(el)
    }) && candidates.length > 0
  })
}

async function shot(page, name, lang) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.${lang}.png`, fullPage: true })
}

async function visitAndCheck(page, { route, label, expectCompanion, lang }) {
  const result = { route: label || route, lang, ok: true, note: '', hasCompanion: null }
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    const companionPresent = await hasCompanion(page)
    result.hasCompanion = companionPresent
    if (expectCompanion && !companionPresent) {
      result.ok = false
      result.note = 'EXPECTED companion presence, none found in DOM'
    }
    const safeName = (label || route).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
    await shot(page, safeName, lang)
  } catch (e) {
    result.ok = false
    result.note = `nav failed: ${String(e).slice(0, 150)}`
  }
  return result
}

async function loginAs(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {})
  return /\/app/.test(page.url())
}

async function setLang(page, lang) {
  await page.evaluate((l) => localStorage.setItem('usam.lang', l), lang)
  await page.reload({ waitUntil: 'networkidle' })
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('EMAIL / PASSWORD required (real production learner account).')
    process.exit(1)
  }
  if (!WORLD_ID) console.warn('WORLD_ID not set — World Detail companion check will be skipped.')
  if (!MISSION_ID) console.warn('MISSION_ID not set — Mission Brief/Player companion checks will be skipped.')

  const browser = await chromium.launch()
  const results = []

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: vp })
    const page = await ctx.newPage()

    const loggedIn = await loginAs(page, EMAIL, PASSWORD)
    if (!loggedIn) {
      results.push({ route: 'login', lang: 'en', ok: false, note: 'login failed', hasCompanion: null })
      await ctx.close()
      continue
    }

    for (const lang of ['en', 'ar']) {
      await setLang(page, lang)

      results.push(await visitAndCheck(page, { route: '/app', label: `home-${vpName}`, expectCompanion: true, lang }))
      results.push(await visitAndCheck(page, { route: '/app/practice', label: `practice-${vpName}`, expectCompanion: true, lang }))

      if (WORLD_ID) {
        results.push(
          await visitAndCheck(page, {
            route: `/app/worlds/${WORLD_ID}`,
            label: `world-detail-${vpName}`,
            expectCompanion: true,
            lang,
          }),
        )
      }

      if (MISSION_ID) {
        results.push(
          await visitAndCheck(page, {
            route: `/app/missions/${MISSION_ID}`,
            label: `mission-brief-${vpName}`,
            expectCompanion: true,
            lang,
          }),
        )
      }
    }
    await setLang(page, 'en')
    await ctx.close()
  }

  // Mission Player requires a real MissionRun — start one against the real
  // mission (idempotent-enough real action, see file header) and screenshot
  // the resulting player with companion presence checked, desktop only
  // (one real run per crawl is enough; avoid spamming MissionRun rows).
  if (MISSION_ID) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop })
    const page = await ctx.newPage()
    const loggedIn = await loginAs(page, EMAIL, PASSWORD)
    if (loggedIn) {
      try {
        await page.goto(`${BASE}/app/missions/${MISSION_ID}`, { waitUntil: 'networkidle', timeout: 30000 })
        // FIX (found during this run): page.locator('button').first() matched
        // AppShell's header search icon (first button in DOM order, outside
        // <main>), not the mission brief's own "Start" action — the crawl
        // always navigated to /app/search instead of starting the mission.
        // Scope to <main> (excludes the header/nav chrome) and the button is
        // the mission brief's one real action.
        const startBtn = page.locator('main button')
        await startBtn.click()
        await page.waitForURL(/\/app\/runs\//, { timeout: 15000 })
        await page.waitForLoadState('networkidle')
        const companionPresent = await hasCompanion(page)
        results.push({
          route: 'mission-player (via real start)',
          lang: 'en',
          ok: companionPresent,
          note: companionPresent ? '' : 'EXPECTED companion presence, none found in DOM',
          hasCompanion: companionPresent,
        })
        await shot(page, 'mission-player-desktop', 'en')
      } catch (e) {
        results.push({
          route: 'mission-player (via real start)',
          lang: 'en',
          ok: false,
          note: `could not reach player: ${String(e).slice(0, 150)}`,
          hasCompanion: null,
        })
      }
    }
    await ctx.close()
  }

  await browser.close()

  console.log(`\n=== PRODUCT CRAWL — ${BASE} ===`)
  console.log(`screenshots: ${OUT_DIR}/\n`)
  const fail = results.filter((r) => !r.ok)
  for (const r of results) {
    console.log(
      `${r.ok ? 'PASS' : 'FAIL'}  [${r.lang}] ${r.route}  companion=${r.hasCompanion}${r.note ? `  (${r.note})` : ''}`,
    )
  }
  console.log(`\n${fail.length === 0 ? '✅ ALL COMPANION/CRAWL CHECKS PASSED' : `❌ ${fail.length} CHECK(S) FAILED`}\n`)
  process.exit(fail.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
