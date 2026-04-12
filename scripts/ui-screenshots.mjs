import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:5175/'
const OUT = 'scripts/screenshots'

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message))
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`shot: ${name}`)
}

// 1. Initial view (desktop)
await shot('01-initial-desktop')

// 2. Mobile view
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
mobile.on('pageerror', (e) => console.error('MOBILE PAGE ERROR', e.message))
await mobile.goto(URL, { waitUntil: 'networkidle' })
await mobile.waitForTimeout(1500)
await mobile.screenshot({ path: `${OUT}/02-initial-mobile.png` })
console.log('shot: 02-initial-mobile')

// 3. Scramble then screenshot mid-animation
await page.getByRole('button', { name: /scramble/i }).click()
await page.waitForTimeout(2000)
await shot('03-scrambling')

// 4. Wait for scramble done, then LBL with teach mode
await page.waitForTimeout(8000)
await page.getByLabel(/教學模式/).check().catch(() => {})
await shot('04-teach-mode-checked')

await page.getByRole('button', { name: /^lbl$/i }).click()
await page.waitForTimeout(15000) // wait for solver
await shot('05-lbl-first-pause')

// 5. Input state - manual
await page.getByRole('button', { name: /input state/i }).click()
await page.waitForTimeout(500)
await shot('06-input-manual')

// 6. Formula tab
await page.getByRole('button', { name: /^formula$/i }).click()
await page.waitForTimeout(500)
await shot('07-input-formula')

// 7. Photo tab
await page.getByRole('button', { name: /^photo$/i }).click()
await page.waitForTimeout(500)
await shot('08-input-photo')

await browser.close()
console.log('done')
