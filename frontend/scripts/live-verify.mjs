/**
 * Authenticated live E2E verification against PRODUCTION ROOT.
 *
 * Adapted from preview-verify.mjs (which targets the old /preview staging
 * mount used during the pre-cutover flow) for the post-cutover reality:
 * the real app now serves directly at https://kids.usamif.com/, no /preview
 * prefix. Drives a real headless browser (Playwright/chromium) against the
 * LIVE production site and the real backend — not mocked /api, not a local
 * build. Reports, per route:
 *   - HTTP reachability (the SPA shell loads)
 *   - console errors (target = 0, after ignoring known third-party noise)
 *   - failed network requests (4xx/5xx/CORS/chunk failures), with URL+status
 *   - auth redirect + role-guard behavior
 *   - required content present (a heading/alert/status renders, not blank)
 *
 * LEARNER coverage runs whenever EMAIL/PASSWORD are provided (a real
 * production account, created via the real POST /auth/register — see the
 * reconciliation session notes for how the current proof account was
 * created). GUARDIAN/MOD/ADMIN are each optional and gated on their own env
 * creds; a role with no creds is reported SKIPPED, never silently treated
 * as passed.
 *
 * Usage:
 *   BASE=https://kids.usamif.com \
 *   EMAIL=<real learner email> PASSWORD=<real learner password> \
 *   node scripts/live-verify.mjs
 *
 * Optional:
 *   GUARDIAN_EMAIL=... GUARDIAN_PASSWORD=...
 *   MOD_EMAIL=...      MOD_PASSWORD=...
 *   ADMIN_EMAIL=...    ADMIN_PASSWORD=...
 *
 * This script performs READ-ONLY navigation (no form submissions beyond
 * login itself) — it does not create/mutate projects, missions, etc. It is
 * safe to run repeatedly against the real production database.
 */
import { chromium } from 'playwright'

const BASE = (process.env.BASE || 'https://kids.usamif.com').replace(/\/$/, '')
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD

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

const ROLE_SETS = [
  {
    key: 'GUARDIAN',
    landingPattern: /\/parent/,
    routes: ['/parent', '/parent/privacy', '/parent/plan'],
  },
  {
    key: 'MOD',
    landingPattern: /\/mod/,
    routes: ['/mod', '/mod/escalations', '/mod/community', '/mod/interventions'],
  },
  {
    key: 'ADMIN',
    landingPattern: /\/admin/,
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

const DYNAMIC_CHILD_ROUTES = [
  { from: '/app/companions', linkPrefix: '/app/companions/', label: '/app/companions/:id (companion chat)' },
  { from: '/app/simulations', linkPrefix: '/app/simulations/', label: '/app/simulations/:slug (sim player)' },
  { from: '/app/learn', linkPrefix: '/app/learn/', label: '/app/learn/:slug (domain path)' },
  { from: '/app/projects', linkPrefix: '/app/projects/', label: '/app/projects/:id (project detail)' },
]

const MISSION_CHAIN = {
  from: '/app/learn',
  hopLinkPrefix: '/app/learn/',
  targetLinkPrefix: '/app/missions/',
  label: '/app/missions/:id (mission detail, via Learn -> Domain)',
}

const CHILD_DETAIL_ROUTE = {
  from: '/parent',
  linkPrefix: '/parent/child/',
  label: '/parent/child/:id (child detail)',
}

const IGNORE_CONSOLE = [
  /React Router Future Flag Warning/i,
  /Download the React DevTools/i,
  /favicon/i,
]
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
    // Content present: a heading/alert/status, OR the design system's
    // EmptyState component (a plain <p> with no semantic role — see
    // components/common/States.tsx). A genuine, honest empty state (e.g.
    // a brand-new learner with zero mastery records) is valid rendered
    // content, not a broken page — this must not false-positive as FAIL.
    const hasContent = await page.evaluate(() => {
      const semantic = document.querySelector('h1, [role="alert"], [role="status"]')
      if (semantic && (semantic.textContent || '').trim().length > 0) return true
      const root = document.getElementById('root')
      return Boolean(root && (root.textContent || '').trim().length > 0)
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

async function loginAs(page, email, password, landingPattern) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(landingPattern, { timeout: 30000 }).catch(() => {})
  return landingPattern.test(page.url())
}

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
  await page.evaluate(() => localStorage.setItem('usam.lang', 'ar'))
  await page.reload({ waitUntil: 'networkidle' })
  const dir = await page.evaluate(() => document.documentElement.dir)
  await page.evaluate(() => localStorage.setItem('usam.lang', 'en'))
  return dir === 'rtl'
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('EMAIL / PASSWORD env vars are required (a real production learner account).')
    process.exit(1)
  }

  const browser = await chromium.launch()
  const results = []
  const dynamicResults = []
  const roleStatus = []
  let rtlOk = false
  let loggedIn = false

  const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/signup', '/how-it-works', '/for-families', '/safety', '/legal']
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    for (const r of PUBLIC_ROUTES) results.push(await checkRoute(page, r))
    rtlOk = await checkRtl(page)
    await ctx.close()
  }

  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    loggedIn = await loginAs(page, EMAIL, PASSWORD, /\/app/)
    if (loggedIn) {
      for (const r of LEARNER_ROUTES) results.push(await checkRoute(page, r))
      for (const dr of DYNAMIC_CHILD_ROUTES) dynamicResults.push(await checkDynamicChildRoute(page, dr))
      dynamicResults.push(await checkDynamicChainRoute(page, MISSION_CHAIN))
    }
    await ctx.close()
  }

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
      for (const r of set.routes) results.push(await checkRoute(page, r))
      if (set.key === 'GUARDIAN') dynamicResults.push(await checkDynamicChildRoute(page, CHILD_DETAIL_ROUTE))
    }
    await ctx.close()
  }

  await browser.close()

  const allChecked = [...results, ...dynamicResults]
  const pass = allChecked.filter((r) => r.ok)
  const fail = allChecked.filter((r) => !r.ok && !r.skipped)
  const skipped = allChecked.filter((r) => r.skipped)
  console.log(`\n=== LIVE VERIFY — ${BASE} ===`)
  console.log(`login: ${loggedIn ? 'OK' : 'FAILED'} · RTL flip: ${rtlOk ? 'OK' : 'FAILED'}`)
  for (const rs of roleStatus) {
    console.log(`role ${rs.key}: ${!rs.ran ? 'SKIPPED (no creds set)' : rs.loggedIn ? 'login OK' : 'LOGIN FAILED'}`)
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
  console.log(`\n${allOk ? '✅ LIVE VERIFY PASSED' : '❌ LIVE VERIFY FAILED'}`)
  if (anySkippedRole) {
    console.log(
      `⚠️  ${roleStatus.filter((rs) => !rs.ran).map((rs) => rs.key).join(', ')} not verified (no creds) — do not treat as cleared.`
    )
  }
  console.log('')
  process.exit(allOk ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
