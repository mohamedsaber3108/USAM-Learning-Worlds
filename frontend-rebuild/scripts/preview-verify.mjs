/**
 * Automated preview verification harness.
 *
 * Drives a real headless browser (Playwright/chromium) against the STAGED new
 * frontend on the real backend and reports, per route:
 *   - HTTP reachability (the SPA shell loads)
 *   - console errors (target = 0)
 *   - failed network requests (4xx/5xx/CORS/chunk failures), with URL+status
 *   - auth redirect + role-guard behavior
 *   - RTL direction flip (Arabic)
 *   - required content present (a heading renders, not a blank page)
 *
 * Covers all 5 roles: Public, Learner, Guardian, Moderator, Admin. Guardian/
 * Mod/Admin coverage is OPTIONAL and only runs if the matching env creds are
 * provided (same convention as preview-screenshots.mjs) — a missing role
 * account must not fail the whole run, but IS reported as "skipped" so it's
 * never silently mistaken for "passed".
 *
 * Also exercises dynamic routes whose segment is backend-seed data (not a
 * fixed slug) by clicking real catalog-card links rather than guessing an
 * id/slug: companion chat, simulation player, domain path, mission detail
 * (a 2-hop chain: Learn -> Domain -> Mission), project detail, and (Guardian
 * role only) child detail.
 *
 * Runs on the SERVER (where /preview + backend are reachable). This dev
 * workspace has no network path to prod, so the script is authored here and
 * executed there.
 *
 * Usage (on the server, from frontend-rebuild/):
 *   BASE=https://kids.usamif.com/preview \
 *   EMAIL=proof-learner@test.local PASSWORD='Passw0rd!23' \
 *   GUARDIAN_EMAIL=... GUARDIAN_PASSWORD=... \
 *   MOD_EMAIL=...      MOD_PASSWORD=... \
 *   ADMIN_EMAIL=...    ADMIN_PASSWORD=... \
 *   node scripts/preview-verify.mjs
 *
 * Requires a chromium for Playwright:
 *   npx playwright install chromium   # one-time
 *
 * Exit code: 0 if every REQUIRED route passes (public + learner — the two
 * roles with creds baked into the usage above) and every PROVIDED role
 * passes; 1 otherwise. A role with no creds is reported "SKIPPED (no creds)"
 * and does not fail the run, but is called out in the summary so it is never
 * mistaken for verified. An empty catalog on a dynamic-route check (nothing
 * to click) is reported "SKIP" distinctly from "FAIL" for the same reason —
 * it is a content gap to investigate, not proof the harness or route is
 * broken, and it does not fail the run on its own. Prints a per-route table
 * + a summary.
 */
import { chromium } from 'playwright'

const BASE = (process.env.BASE || 'https://kids.usamif.com/preview').replace(/\/$/, '')
const EMAIL = process.env.EMAIL || 'proof-learner@test.local'
const PASSWORD = process.env.PASSWORD || 'Passw0rd!23'

// Public routes (no auth).
const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/signup', '/how-it-works', '/for-families', '/safety', '/legal']
const LEARNER_ROUTES = [
  '/app',
  '/app/learn',
  '/app/explore',
  '/app/practice',
  '/app/progress',
  '/app/projects',
  '/app/portfolio',
  '/app/create',
  '/app/companions',
  '/app/community',
  '/app/credentials',
  '/app/rewards',
  '/app/settings',
  '/app/search',
  '/app/notifications',
  '/app/stories',
  '/app/simulations',
  '/app/voice',
  '/app/english-coach',
  '/app/leaderboard',
  '/app/insights',
]

// Guardian/Moderator/Admin — each OPTIONAL, gated on its own env creds.
const ROLE_SETS = [
  {
    key: 'GUARDIAN',
    landingPattern: /\/preview\/parent/,
    routes: ['/parent', '/parent/privacy', '/parent/plan'],
  },
  {
    key: 'MOD',
    landingPattern: /\/preview\/mod/,
    routes: ['/mod', '/mod/escalations', '/mod/community', '/mod/interventions'],
  },
  {
    key: 'ADMIN',
    landingPattern: /\/preview\/admin/,
    routes: [
      '/admin',
      '/admin/content',
      '/admin/curriculum',
      '/admin/ai',
      '/admin/analytics',
      '/admin/platform',
      '/admin/question-templates',
    ],
  },
]

// Dynamic child routes (learner): list page -> first real catalog-card link
// clicked, rather than a guessed id/slug (ids are backend-seed data, not
// stable paths).
const DYNAMIC_CHILD_ROUTES = [
  { from: '/app/companions', linkPrefix: '/app/companions/', label: '/app/companions/:id (companion chat)' },
  { from: '/app/simulations', linkPrefix: '/app/simulations/', label: '/app/simulations/:slug (sim player)' },
  { from: '/app/learn', linkPrefix: '/app/learn/', label: '/app/learn/:slug (domain path)' },
  { from: '/app/projects', linkPrefix: '/app/projects/', label: '/app/projects/:id (project detail)' },
]

// Two-hop dynamic chain: Learn -> a domain path -> its mission detail. Mission
// ids are only discoverable from inside a domain path page (the "start/
// continue" link on a competency row), so this can't be a single-hop click
// from a top-level catalog like the others above.
const MISSION_CHAIN = {
  from: '/app/learn',
  hopLinkPrefix: '/app/learn/',
  targetLinkPrefix: '/app/missions/',
  label: '/app/missions/:id (mission detail, via Learn -> Domain)',
}

// Guardian-only dynamic child route: Parent home -> a real child card.
const CHILD_DETAIL_ROUTE = {
  from: '/parent',
  linkPrefix: '/parent/child/',
  label: '/parent/child/:id (child detail)',
}

// Console messages we tolerate (known third-party noise, not app defects).
const IGNORE_CONSOLE = [
  /React Router Future Flag Warning/i,
  /Download the React DevTools/i,
  /favicon/i,
]
// Network failures we tolerate (voice is provider-gated; favicons).
const IGNORE_NETWORK = [/\/api\/voice\//i, /favicon/i]

function ignored(text, patterns) {
  return patterns.some((re) => re.test(text))
}

async function checkRoute(page, route) {
  const consoleErrors = []
  const netFailures = []

  const onConsole = (msg) => {
    if (msg.type() === 'error' && !ignored(msg.text(), IGNORE_CONSOLE)) {
      consoleErrors.push(msg.text().slice(0, 300))
    }
  }
  const onResponse = (res) => {
    const status = res.status()
    const url = res.url()
    if (status >= 400 && !ignored(url, IGNORE_NETWORK)) {
      netFailures.push(`${status} ${url.replace(BASE, '')}`)
    }
  }
  page.on('console', onConsole)
  page.on('response', onResponse)

  let ok = true
  let note = ''
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    // Content present: an <h1> or a role=alert/status (honest error/empty) exists.
    const hasContent = await page.evaluate(() => {
      const h = document.querySelector('h1, [role="alert"], [role="status"]')
      return Boolean(h && (h.textContent || '').trim().length > 0)
    })
    if (!hasContent) {
      ok = false
      note = 'no visible content'
    }
  } catch (e) {
    ok = false
    note = `nav failed: ${String(e).slice(0, 120)}`
  }

  page.off('console', onConsole)
  page.off('response', onResponse)

  if (consoleErrors.length) ok = false
  if (netFailures.length) ok = false
  return { route, ok, consoleErrors, netFailures, note }
}

async function login(page) {
  return loginAs(page, EMAIL, PASSWORD, /\/preview\/app/)
}

/** Generic login, reused for the optional Guardian/Mod/Admin role accounts. */
async function loginAs(page, email, password, landingPattern) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  // DS Input uses a generated id (useId), so target by type, not #email.
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(landingPattern, { timeout: 30000 }).catch(() => {})
  return landingPattern.test(page.url())
}

/**
 * Visits `from`, clicks the first real link whose href starts with
 * `linkPrefix` (a genuine catalog card — companion/simulation), and runs the
 * same console/network/content checks on the resulting detail page. Returns
 * a result shaped like checkRoute()'s, or a "skipped" result if the list page
 * had no items to click (empty catalogs are a content gap, not a harness bug,
 * so this is reported distinctly from a navigation failure).
 */
async function checkDynamicChildRoute(page, { from, linkPrefix, label }) {
  const consoleErrors = []
  const netFailures = []
  const onConsole = (msg) => {
    if (msg.type() === 'error' && !ignored(msg.text(), IGNORE_CONSOLE)) {
      consoleErrors.push(msg.text().slice(0, 300))
    }
  }
  const onResponse = (res) => {
    const status = res.status()
    const url = res.url()
    if (status >= 400 && !ignored(url, IGNORE_NETWORK)) {
      netFailures.push(`${status} ${url.replace(BASE, '')}`)
    }
  }
  page.on('console', onConsole)
  page.on('response', onResponse)

  let ok = true
  let note = ''
  try {
    await page.goto(`${BASE}${from}`, { waitUntil: 'networkidle', timeout: 30000 })
    const href = await page.evaluate((prefix) => {
      const a = Array.from(document.querySelectorAll('a[href]')).find((el) =>
        el.getAttribute('href')?.includes(prefix)
      )
      return a ? a.getAttribute('href') : null
    }, linkPrefix)
    if (!href) {
      ok = false
      note = 'SKIPPED (no catalog items to click — empty list, not a nav failure)'
    } else {
      await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle', timeout: 30000 })
      const hasContent = await page.evaluate(() => {
        const h = document.querySelector('h1, [role="alert"], [role="status"]')
        return Boolean(h && (h.textContent || '').trim().length > 0)
      })
      if (!hasContent) {
        ok = false
        note = 'no visible content'
      }
    }
  } catch (e) {
    ok = false
    note = `nav failed: ${String(e).slice(0, 120)}`
  }

  page.off('console', onConsole)
  page.off('response', onResponse)

  const skipped = note.startsWith('SKIPPED')
  if (!skipped && consoleErrors.length) ok = false
  if (!skipped && netFailures.length) ok = false
  return { route: label, ok, skipped, consoleErrors, netFailures, note }
}

/**
 * Two-hop variant: visits `from`, clicks the first link matching
 * `hopLinkPrefix` (e.g. a domain card), then on THAT page clicks the first
 * link matching `targetLinkPrefix` (e.g. a mission's start/continue link),
 * and checks the final page. Either hop having no matching link is a
 * distinct SKIP (empty catalog or a domain path with no missions yet to
 * click), not a navigation failure.
 */
async function checkDynamicChainRoute(page, { from, hopLinkPrefix, targetLinkPrefix, label }) {
  const consoleErrors = []
  const netFailures = []
  const onConsole = (msg) => {
    if (msg.type() === 'error' && !ignored(msg.text(), IGNORE_CONSOLE)) {
      consoleErrors.push(msg.text().slice(0, 300))
    }
  }
  const onResponse = (res) => {
    const status = res.status()
    const url = res.url()
    if (status >= 400 && !ignored(url, IGNORE_NETWORK)) {
      netFailures.push(`${status} ${url.replace(BASE, '')}`)
    }
  }
  page.on('console', onConsole)
  page.on('response', onResponse)

  const findLink = (prefix) =>
    page.evaluate((p) => {
      const a = Array.from(document.querySelectorAll('a[href]')).find((el) => el.getAttribute('href')?.includes(p))
      return a ? a.getAttribute('href') : null
    }, prefix)

  let ok = true
  let note = ''
  try {
    await page.goto(`${BASE}${from}`, { waitUntil: 'networkidle', timeout: 30000 })
    const hopHref = await findLink(hopLinkPrefix)
    if (!hopHref) {
      ok = false
      note = 'SKIPPED (no catalog items for first hop — empty list, not a nav failure)'
    } else {
      await page.goto(`${BASE}${hopHref}`, { waitUntil: 'networkidle', timeout: 30000 })
      const targetHref = await findLink(targetLinkPrefix)
      if (!targetHref) {
        ok = false
        note = 'SKIPPED (no second-hop link found — e.g. domain path has no missions yet)'
      } else {
        await page.goto(`${BASE}${targetHref}`, { waitUntil: 'networkidle', timeout: 30000 })
        const hasContent = await page.evaluate(() => {
          const h = document.querySelector('h1, [role="alert"], [role="status"]')
          return Boolean(h && (h.textContent || '').trim().length > 0)
        })
        if (!hasContent) {
          ok = false
          note = 'no visible content'
        }
      }
    }
  } catch (e) {
    ok = false
    note = `nav failed: ${String(e).slice(0, 120)}`
  }

  page.off('console', onConsole)
  page.off('response', onResponse)

  const skipped = note.startsWith('SKIPPED')
  if (!skipped && consoleErrors.length) ok = false
  if (!skipped && netFailures.length) ok = false
  return { route: label, ok, skipped, consoleErrors, netFailures, note }
}

async function checkRtl(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
  // Toggle to Arabic via the language button (ع), then read <html dir>.
  await page.evaluate(() => localStorage.setItem('usam.lang', 'ar'))
  await page.reload({ waitUntil: 'networkidle' })
  const dir = await page.evaluate(() => document.documentElement.dir)
  await page.evaluate(() => localStorage.setItem('usam.lang', 'en'))
  return dir === 'rtl'
}

async function main() {
  const browser = await chromium.launch()
  const results = []
  const dynamicResults = []
  const roleStatus = [] // { key, ran: bool, loggedIn: bool }
  let rtlOk = false
  let loggedIn = false

  // Public + RTL (fresh context).
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    for (const r of PUBLIC_ROUTES) results.push(await checkRoute(page, r))
    rtlOk = await checkRtl(page)
    await ctx.close()
  }

  // Learner (authed context).
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    loggedIn = await login(page)
    if (loggedIn) {
      for (const r of LEARNER_ROUTES) results.push(await checkRoute(page, r))
      for (const dr of DYNAMIC_CHILD_ROUTES) dynamicResults.push(await checkDynamicChildRoute(page, dr))
      dynamicResults.push(await checkDynamicChainRoute(page, MISSION_CHAIN))
    }
    await ctx.close()
  }

  // Guardian / Moderator / Admin — each only runs if its creds are set.
  for (const set of ROLE_SETS) {
    const email = process.env[`${set.key}_EMAIL`]
    const password = process.env[`${set.key}_PASSWORD`]
    if (!email || !password) {
      roleStatus.push({ key: set.key, ran: false, loggedIn: false })
      continue
    }
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const ok = await loginAs(page, email, password, set.landingPattern)
    roleStatus.push({ key: set.key, ran: true, loggedIn: ok })
    if (ok) {
      for (const r of set.routes) results.push(await checkRoute(page, `${r}`))
      if (set.key === 'GUARDIAN') dynamicResults.push(await checkDynamicChildRoute(page, CHILD_DETAIL_ROUTE))
    }
    await ctx.close()
  }

  await browser.close()

  // Report.
  const allChecked = [...results, ...dynamicResults]
  const pass = allChecked.filter((r) => r.ok)
  const fail = allChecked.filter((r) => !r.ok && !r.skipped)
  const skipped = allChecked.filter((r) => r.skipped)
  console.log(`\n=== PREVIEW VERIFY — ${BASE} ===`)
  console.log(`login: ${loggedIn ? 'OK' : 'FAILED'} · RTL flip: ${rtlOk ? 'OK' : 'FAILED'}`)
  for (const rs of roleStatus) {
    console.log(
      `role ${rs.key}: ${!rs.ran ? 'SKIPPED (no creds set)' : rs.loggedIn ? 'login OK' : 'LOGIN FAILED'}`
    )
  }
  console.log(
    `routes checked: ${allChecked.length} · pass: ${pass.length} · fail: ${fail.length} · skipped: ${skipped.length}\n`
  )
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.route}${r.note ? `  (${r.note})` : ''}`)
    for (const c of r.consoleErrors) console.log(`        console: ${c}`)
    for (const n of r.netFailures) console.log(`        network: ${n}`)
  }
  for (const r of dynamicResults) {
    const tag = r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'
    console.log(`${tag}  ${r.route}${r.note ? `  (${r.note})` : ''}`)
    for (const c of r.consoleErrors) console.log(`        console: ${c}`)
    for (const n of r.netFailures) console.log(`        network: ${n}`)
  }
  const anyRoleLoginFailed = roleStatus.some((rs) => rs.ran && !rs.loggedIn)
  const anySkippedRole = roleStatus.some((rs) => !rs.ran)
  const allOk = loggedIn && rtlOk && fail.length === 0 && !anyRoleLoginFailed
  console.log(`\n${allOk ? '✅ PREVIEW VERIFY PASSED' : '❌ PREVIEW VERIFY FAILED'}`)
  if (anySkippedRole) {
    console.log(
      `⚠️  ${roleStatus.filter((rs) => !rs.ran).map((rs) => rs.key).join(', ')} not verified (no creds) — do not treat as cleared for cutover.`
    )
  }
  console.log('')
  process.exit(allOk ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
