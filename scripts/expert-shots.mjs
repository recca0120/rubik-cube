import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:5173/'
const OUT = 'scripts/screenshots/expert'
mkdirSync(OUT, { recursive: true })

const SOLVED = 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)
const allDone = Object.fromEntries([1,2,3,4,5,6,7,8,9].map((i) => [i, 3]))

const seed = ({ mode = 'expert', onboarded = true, stars = allDone }) => JSON.stringify({
  state: {
    facelets: SOLVED, appMode: mode, wizardChapter: 1, wizardStep: 0,
    earnedStars: stars, expertOnboarded: onboarded,
  },
  version: 0,
})

const browser = await chromium.launch()

for (const vp of [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'mobile', width: 390, height: 844 },
]) {
  async function shot(s, name, setup) {
    const page = await browser.newPage({ viewport: vp })
    await page.addInitScript((v) => { localStorage.clear(); localStorage.setItem('rubik-cube', v) }, s)
    await page.goto(URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    if (setup) await setup(page)
    await page.screenshot({ path: `${OUT}/${name}-${vp.label}.png`, fullPage: name === '01-welcome-all-stars' })
    console.log(`shot: ${name}-${vp.label}`)
    await page.close()
  }

  // A. Welcome with 🎓 專家入口 visible
  await shot(seed({ mode: 'welcome', onboarded: false }), '01-welcome-all-stars')

  // B. First entry ExpertHome (graduation)
  await shot(seed({ mode: 'expert', onboarded: false }), '02-expert-home')

  // C. ExpertPage 解 tab (default, no solve yet)
  await shot(seed({}), '03-expert-solve-empty')

  // D. 解 tab with a LBL solve played
  await shot(seed({}), '04-expert-solve-after-lbl', async (page) => {
    await page.getByRole('button', { name: /打亂/ }).click()
    await page.waitForTimeout(10_000) // let scramble play
    await page.getByRole('button', { name: /^▶ LBL$|^LBL$/ }).click({ force: true })
    await page.waitForTimeout(2500)
  })

  // E. 對照 panel
  await shot(seed({}), '05-expert-compare', async (page) => {
    await page.getByRole('button', { name: /打亂/ }).click()
    await page.waitForTimeout(10_000)
    await page.getByRole('button', { name: /對照/ }).click({ force: true })
    await page.waitForTimeout(4000)
  })

  // F. 輸入 drawer
  await shot(seed({}), '06-expert-input-drawer', async (page) => {
    await page.getByRole('button', { name: /輸入/ }).first().click()
    await page.waitForTimeout(400)
  })

  // G. 案例 F2L tab
  await shot(seed({}), '07-expert-cases-f2l', async (page) => {
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    await page.waitForTimeout(400)
  })

  // I. 案例 apply dock
  await shot(seed({}), '09-expert-cases-apply-dock', async (page) => {
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    await page.waitForTimeout(300)
    await page.locator('[data-testid^="case-card-"]').first().click({ force: true })
    await page.waitForSelector('[data-testid="case-apply-dock"]', { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(400)
  })

  // H. 案例 PLL
  await shot(seed({}), '08-expert-cases-pll', async (page) => {
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    await page.waitForTimeout(200)
    await page.getByRole('tab', { name: /^PLL/ }).click()
    await page.waitForTimeout(300)
  })
}

await browser.close()
console.log('done')
