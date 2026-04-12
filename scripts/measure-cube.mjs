import { chromium } from 'playwright'

const URL = process.env.URL ?? 'http://localhost:5175/'
const SOLVED = 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)

async function measure(label, seed) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript((s) => {
    localStorage.clear()
    if (s) localStorage.setItem('rubik-cube', s)
  }, seed)
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const dims = await page.evaluate(() => {
    const main = document.querySelector('main')
    const canvas = document.querySelector('canvas')
    const footer = document.querySelector('footer')
    const vp = { w: window.innerWidth, h: window.innerHeight }
    return {
      viewport: vp,
      main: main ? { w: main.clientWidth, h: main.clientHeight } : null,
      canvas: canvas ? { w: canvas.clientWidth, h: canvas.clientHeight } : null,
      footer: footer ? { w: footer.clientWidth, h: footer.clientHeight } : null,
    }
  })
  console.log(label, JSON.stringify(dims))
  await browser.close()
}

const mkSeed = (chapter, step, earnedStars = { 1: 1 }) =>
  JSON.stringify({
    state: {
      facelets: SOLVED,
      appMode: 'wizard',
      wizardChapter: chapter,
      wizardStep: step,
      earnedStars,
    },
    version: 0,
  })

await measure('Ch1 step0 (intro, no keypad)', mkSeed(1, 0, {}))
await measure('Ch2 step0 (intro, no keypad)', mkSeed(2, 0))
await measure('Ch2 step1 (U demo, playMoves)', mkSeed(2, 1))
await measure('Ch2 step2 (U practice, keypad + hint)', mkSeed(2, 2))
await measure('Ch2 step7 (R practice)', mkSeed(2, 7))
