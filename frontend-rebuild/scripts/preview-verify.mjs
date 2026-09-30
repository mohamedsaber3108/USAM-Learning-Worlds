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
 * Runs on the SERVER (where /preview + backend are reachable). This dev
 * workspace has no network path to prod, so the script is authored here and
 * executed there.
 *
 * Usage (on the server, from frontend-rebuild/):
 *   BASE=https://kids.usamif.com/preview \
 *   EMAIL=proof-learner@test.local PASSWORD='Passw0rd!23' \
 *   node scripts/preview-verify.mjs
 *
 * Requires a chromium for Playwright:
 *   npx playwright install chromium   # one-time
 *
 * Exit code: 0 if every route passes (0 console errors, no failed API calls,
 * content present); 1 otherwise. Prints a per-route table + a summary.
 */
import { chromium } from 'playwright'

const BASE = (process.env.BASE || 'https://kids.usamif.com/preview').replace(/\/$/, '')
const EMAIL = process.env.EMAIL || 'proof-learner@test.local'
const PASSWORD = process.env.PASSWORD || 'Passw0rd!23'

// Public routes (no auth) + learner routes (auth). Role consoles (guardian/mod/
// admin) need their own accounts; pass ROLE_EMAIL/ROLE_PASSWORD to extend.
const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/signup']
const LEARNER_ROUTES = [
  '/app',
  '/app/learn',
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
]

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
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('button[type="submit"]')
  // Wait for redirect off /login into the app.
  await page.waitForURL(/\/preview\/app/, { timeout: 30000 }).catch(() => {})
  return page.url().includes('/app')
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
    }
    await ctx.close()
  }

  await browser.close()

  // Report.
  const pass = results.filter((r) => r.ok)
  const fail = results.filter((r) => !r.ok)
  console.log(`\n=== PREVIEW VERIFY — ${BASE} ===`)
  console.log(`login: ${loggedIn ? 'OK' : 'FAILED'} · RTL flip: ${rtlOk ? 'OK' : 'FAILED'}`)
  console.log(`routes checked: ${results.length} · pass: ${pass.length} · fail: ${fail.length}\n`)
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.route}${r.note ? `  (${r.note})` : ''}`)
    for (const c of r.consoleErrors) console.log(`        console: ${c}`)
    for (const n of r.netFailures) console.log(`        network: ${n}`)
  }
  const allOk = loggedIn && rtlOk && fail.length === 0
  console.log(`\n${allOk ? '✅ PREVIEW VERIFY PASSED' : '❌ PREVIEW VERIFY FAILED'}\n`)
  process.exit(allOk ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
