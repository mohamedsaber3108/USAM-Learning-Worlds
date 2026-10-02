/**
 * One-off forensic screenshot capture for the 7-hour recovery audit.
 * Logs in as a real learner proof account and captures full-page PNGs of
 * the pages changed in the last 7 hours, to visually prove the deployed
 * code is actually rendering (not just present in the bundle).
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.BASE || 'https://kids.usamif.com'
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD
const OUT = process.env.OUT || 'forensic-screenshots'

const PAGES = [
  ['landing-logged-out', '/'],
  ['home', '/app'],
  ['learn', '/app/learn'],
  ['projects', '/app/projects'],
  ['rewards', '/app/rewards'],
  ['settings', '/app/settings'],
  ['community', '/app/community'],
  ['portfolio', '/app/portfolio'],
]

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // Capture logged-out landing first.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.screenshot({ path: `${OUT}/landing-logged-out.png`, fullPage: true })

  // Login.
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {})
  console.log('post-login URL:', page.url())

  for (const [name, route] of PAGES.slice(1)) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
      const title = await page.evaluate(() => document.querySelector('h1')?.textContent || '(no h1)')
      console.log(`${route} -> captured, h1="${title}"`)
    } catch (e) {
      console.log(`${route} -> FAILED: ${String(e).slice(0, 150)}`)
    }
  }

  await browser.close()
  console.log('Done. Screenshots in', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
