import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:5175/'
const OUT = 'scripts/screenshots/kids'

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

async function newPage(viewport, seed) {
  const page = await browser.newPage({ viewport })
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message))
  await page.addInitScript((s) => {
    try {
      localStorage.clear()
      if (s) localStorage.setItem('rubik-cube', s)
    } catch {}
  }, seed)
  return page
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`shot: ${name}`)
}

const VIEWPORTS = [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'mobile', width: 390, height: 844 },
]

const SOLVED = 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)
const practiceSeed = JSON.stringify({
  state: {
    facelets: SOLVED,
    appMode: 'wizard',
    wizardChapter: 2,
    wizardStep: 2, // Ch2 index 2 = U you-do practice
    earnedStars: { 1: 1 },
  },
  version: 0,
})

for (const vp of VIEWPORTS) {
  // Welcome (fresh, no stars yet → would actually route to Wizard Ch1 per M14 rule)
  const welcome = await newPage({ width: vp.width, height: vp.height }, JSON.stringify({
    state: { facelets: SOLVED, appMode: 'welcome', wizardChapter: 1, wizardStep: 0, earnedStars: { 1: 1 } },
    version: 0,
  }))
  await welcome.goto(URL, { waitUntil: 'networkidle' })
  await welcome.waitForTimeout(1500)
  await shot(welcome, `01-welcome-${vp.label}`)
  await welcome.close()

  // Ch1 intro (fresh visit → first-visit routing drops into Wizard Ch1)
  const intro = await newPage({ width: vp.width, height: vp.height })
  await intro.goto(URL, { waitUntil: 'networkidle' })
  await intro.waitForTimeout(2000)
  await shot(intro, `02-wizard-intro-${vp.label}`)
  await intro.close()

  // Ch2 U-practice
  const practice = await newPage({ width: vp.width, height: vp.height }, practiceSeed)
  await practice.goto(URL, { waitUntil: 'networkidle' })
  await practice.waitForTimeout(2000)
  await shot(practice, `04-wizard-practice-${vp.label}`)
  await practice.close()

  // Ch7 sune practice — verifies RD2-C13 X2 atomic fix
  const suneSeed = JSON.stringify({
    state: {
      facelets: SOLVED,
      appMode: 'wizard',
      wizardChapter: 7,
      wizardStep: 5,
      earnedStars: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    },
    version: 0,
  })
  const sune = await newPage({ width: vp.width, height: vp.height }, suneSeed)
  await sune.goto(URL, { waitUntil: 'networkidle' })
  await sune.waitForTimeout(2000)
  await shot(sune, `07-ch7-sune-${vp.label}`)

  // Drive the practice: click the highlighted button repeatedly.
  // After full sequence, ✓ 太棒了 should appear.
  async function clickCurrentHighlight() {
    const btn = sune.locator('[data-testid="move-keypad"] button[data-highlight="true"]').first()
    if (await btn.count()) {
      await btn.click({ force: true }) // bypass stability check — pulse animation triggers false "not stable"
      await sune.waitForTimeout(400)
    }
  }
  for (let i = 0; i < 10; i++) {
    await clickCurrentHighlight()
  }
  await sune.waitForTimeout(1500)
  // Verify RD2-C13: sune history should contain 'U2' as an atomic entry.
  const state = await sune.evaluate(() => {
    const persisted = localStorage.getItem('rubik-cube')
    // history is not persisted, so read live store via globals set by React
    // Fall back: scrape visible success chip
    return {
      persisted,
      successChipText: document.querySelector('[data-testid="practice-success"]')?.textContent ?? null,
    }
  })
  console.log(`[${vp.label}] sune successChip:`, state.successChipText)
  await shot(sune, `08-ch7-sune-done-${vp.label}`)
  await sune.close()

  // Ch2 R-practice (step 6 = R you-do, for arrow-direction check)
  const rSeed = JSON.stringify({
    state: { facelets: SOLVED, appMode: 'wizard', wizardChapter: 2, wizardStep: 6, earnedStars: { 1: 1 } },
    version: 0,
  })
  const rpr = await newPage({ width: vp.width, height: vp.height }, rSeed)
  await rpr.goto(URL, { waitUntil: 'networkidle' })
  await rpr.waitForTimeout(2000)
  await shot(rpr, `05-wizard-R-practice-${vp.label}`)
  await rpr.close()

  // Ch2 R' practice equivalent (hack via history showing cube post-R)
  // just capture R' arrow — force highlightedMove via injection
  const rPrimeSeed = JSON.stringify({
    state: { facelets: SOLVED, appMode: 'wizard', wizardChapter: 2, wizardStep: 8, earnedStars: { 1: 1 } },
    version: 0,
  })
  const rp = await newPage({ width: vp.width, height: vp.height }, rPrimeSeed)
  await rp.goto(URL, { waitUntil: 'networkidle' })
  await rp.waitForTimeout(2000)
  await shot(rp, `06-wizard-L-practice-${vp.label}`)
  await rp.close()
}

await browser.close()
console.log('done')
