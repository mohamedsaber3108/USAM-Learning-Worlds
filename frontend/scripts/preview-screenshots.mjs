/**
 * Visual-QA screenshot capture for the STAGED preview.
 *
 * Renders every major page in a real headless browser across three viewports
 * (desktop / tablet / mobile) and both languages (EN / AR-RTL), writing full-
 * page PNGs to ./qa-screenshots/. This produces the ACTUAL PIXELS needed for a
 * visual/UX review — reachability/console checks live in preview-verify.mjs.
 *
 * Runs on the SERVER (where /preview + the backend are reachable).
 *
 * Usage (from frontend-rebuild/ on the server):
 *   BASE=https://kids.usamif.com/preview \
 *   EMAIL=proof-learner@test.local PASSWORD='Passw0rd!23' \
 *   node scripts/preview-screenshots.mjs
 *
 * Optional role accounts for guardian/moderator/admin captures:
 *   GUARDIAN_EMAIL=... GUARDIAN_PASSWORD=...
 *   MOD_EMAIL=...      MOD_PASSWORD=...
 *   ADMIN_EMAIL=...    ADMIN_PASSWORD=...
 *
 * Output: qa-screenshots/<lang>/<viewport>/<page>.png  (+ an index.html gallery)
 * Then review them locally, or copy off the server, e.g.:
 *   tar czf qa-screenshots.tgz qa-screenshots && scp ...:.../qa-screenshots.tgz .
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = (process.env.BASE || 'https://kids.usamif.com/preview').replace(/\/$/, '')
const EMAIL = process.env.EMAIL || 'proof-learner@test.local'
const PASSWORD = process.env.PASSWORD || 'Passw0rd!23'
const OUT = 'qa-screenshots'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
]

const LANGS = ['en', 'ar']

// Public + learner pages (learner requires the proof-learner login).
const PUBLIC_PAGES = [
  ['landing', '/'],
  ['pricing', '/pricing'],
  ['login', '/login'],
  ['signup', '/signup'],
  ['how-it-works', '/how-it-works'],
  ['for-families', '/for-families'],
  ['safety', '/safety'],
  ['legal', '/legal'],
]
const LEARNER_PAGES = [
  ['onboarding', '/onboarding'],
  ['home', '/app'],
  ['learn', '/app/learn'],
  ['practice', '/app/practice'],
  ['progress', '/app/progress'],
  ['projects', '/app/projects'],
  ['portfolio', '/app/portfolio'],
  ['create', '/app/create'],
  ['companions', '/app/companions'],
  ['community', '/app/community'],
  ['credentials', '/app/credentials'],
  ['rewards', '/app/rewards'],
  ['settings', '/app/settings'],
  ['stories', '/app/stories'],
  ['simulations', '/app/simulations'],
  ['voice', '/app/voice'],
  ['english-coach', '/app/english-coach'],
  ['leaderboard', '/app/leaderboard'],
  ['insights', '/app/insights'],
]

// Optional role captures if creds are provided.
const ROLE_SETS = [
  {
    env: 'GUARDIAN',
    pages: [
      ['parent-home', '/parent'],
      ['parent-privacy', '/parent/privacy'],
      ['parent-plan', '/parent/plan'],
    ],
    landing: /\/preview\/parent/,
  },
  {
    env: 'MOD',
    pages: [
      ['mod-home', '/mod'],
      ['mod-escalations', '/mod/escalations'],
      ['mod-community', '/mod/community'],
      ['mod-interventions', '/mod/interventions'],
    ],
    landing: /\/preview\/mod/,
  },
  {
    env: 'ADMIN',
    pages: [
      ['admin-overview', '/admin'],
      ['admin-content', '/admin/content'],
      ['admin-curriculum', '/admin/curriculum'],
      ['admin-ai', '/admin/ai'],
      ['admin-analytics', '/admin/analytics'],
      ['admin-platform', '/admin/platform'],
      ['admin-question-templates', '/admin/question-templates'],
    ],
    landing: /\/preview\/admin/,
  },
]

async function setLang(page, lang) {
  await page.addInitScript((l) => {
    try { localStorage.setItem('usam.lang', l) } catch {}
  }, lang)
}

async function shoot(page, lang, vp, name, route, manifest) {
  const dir = path.join(OUT, lang, vp.name)
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `${name}.png`)
  let status = 'ok'
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 })
    // let entry animations settle
    await page.waitForTimeout(700)
    await page.screenshot({ path: file, fullPage: true })
  } catch (e) {
    status = `error: ${String(e).slice(0, 100)}`
    try { await page.screenshot({ path: file }) } catch {}
  }
  manifest.push({ lang, viewport: vp.name, name, route, file, status })
  console.log(`  ${status === 'ok' ? '📸' : '⚠️ '} ${lang}/${vp.name}/${name}  ${status === 'ok' ? '' : status}`)
}

async function loginAs(page, email, password, landing) {
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 45000 })
    // DS Input uses a generated id (useId), so target by type, not #email.
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL(landing, { timeout: 30000 }).catch(() => {})
    return landing.test(page.url())
  } catch (e) {
    console.log(`  ⚠️  login threw: ${String(e).slice(0, 120)}`)
    return false
  }
}

async function main() {
  const browser = await chromium.launch()
  const manifest = []

  for (const lang of LANGS) {
    for (const vp of VIEWPORTS) {
      // Public (fresh, unauth context).
      {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
        const page = await ctx.newPage()
        await setLang(page, lang)
        for (const [name, route] of PUBLIC_PAGES) await shoot(page, lang, vp, name, route, manifest)
        await ctx.close()
      }
      // Learner (authed context).
      {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
        const page = await ctx.newPage()
        await setLang(page, lang)
        const ok = await loginAs(page, EMAIL, PASSWORD, /\/preview\/app/)
        if (ok) {
          for (const [name, route] of LEARNER_PAGES) await shoot(page, lang, vp, name, route, manifest)
        } else {
          console.log(`  ⚠️  learner login failed (${lang}/${vp.name}) — skipping learner pages`)
        }
        await ctx.close()
      }
      // Optional roles.
      for (const set of ROLE_SETS) {
        const email = process.env[`${set.env}_EMAIL`]
        const password = process.env[`${set.env}_PASSWORD`]
        if (!email || !password) continue
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
        const page = await ctx.newPage()
        await setLang(page, lang)
        const ok = await loginAs(page, email, password, set.landing)
        if (ok) {
          for (const [name, route] of set.pages) await shoot(page, lang, vp, name, route, manifest)
        } else {
          console.log(`  ⚠️  ${set.env} login failed (${lang}/${vp.name}) — skipping`)
        }
        await ctx.close()
      }
    }
  }

  await browser.close()

  // Simple gallery so the whole set is reviewable in one page.
  const byGroup = {}
  for (const m of manifest) {
    const key = `${m.lang} · ${m.viewport}`
    ;(byGroup[key] ||= []).push(m)
  }
  const html = `<!doctype html><meta charset="utf-8"><title>USAM preview QA</title>
<style>body{font:14px/1.4 system-ui;margin:24px;background:#0b0b0b;color:#eee}
h2{margin:32px 0 8px;border-bottom:1px solid #333;padding-bottom:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
figure{margin:0;background:#151515;border:1px solid #262626;border-radius:10px;overflow:hidden}
figcaption{padding:8px 10px;font-size:12px;color:#9ca3af}
img{width:100%;display:block;border-bottom:1px solid #262626}
.err{color:#f87171}</style>
<h1>USAM preview visual QA — ${BASE}</h1>
${Object.entries(byGroup).map(([g, items]) => `<h2>${g}</h2><div class="grid">${items
    .map((m) => `<figure><a href="${path.relative(OUT, m.file)}"><img loading="lazy" src="${path.relative(OUT, m.file)}"></a><figcaption>${m.name} <span class="${m.status === 'ok' ? '' : 'err'}">${m.status === 'ok' ? '' : m.status}</span></figcaption></figure>`)
    .join('')}</div>`).join('')}`
  await writeFile(path.join(OUT, 'index.html'), html)

  const shot = manifest.filter((m) => m.status === 'ok').length
  const bad = manifest.filter((m) => m.status !== 'ok')
  console.log(`\n=== SCREENSHOTS — ${BASE} ===`)
  console.log(`captured: ${shot}/${manifest.length}`)
  if (bad.length) {
    console.log(`problems (${bad.length}):`)
    for (const b of bad) console.log(`  ${b.lang}/${b.viewport}/${b.name} — ${b.status}`)
  }
  console.log(`\nGallery: ${path.join(OUT, 'index.html')}`)
  console.log(`Copy off server e.g.:  tar czf qa-screenshots.tgz ${OUT}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
