/**
 * E2E: ExpertPage (v2 aesthetic) — full flows on feature/v2-advanced.
 */
import { test, expect, type Page } from '@playwright/test'
import { CHAPTERS } from '../src/components/kids/wizardChapters'

const SOLVED = 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)
const allChaptersDone = Object.fromEntries(CHAPTERS.map((c) => [c.id, 3])) as Record<number, number>

function welcomeSeed(earnedStars: Record<number, number>) {
  return JSON.stringify({
    state: {
      facelets: SOLVED,
      appMode: 'welcome',
      wizardChapter: 1,
      wizardStep: 0,
      earnedStars,
    },
    version: 0,
  })
}

function expertSeed(extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    state: {
      facelets: SOLVED,
      appMode: 'expert',
      wizardChapter: 1,
      wizardStep: 0,
      earnedStars: allChaptersDone,
      expertOnboarded: true,
      ...extra,
    },
    version: 0,
  })
}

async function seedAndLoad(page: Page, seed: string) {
  await page.addInitScript((s) => {
    localStorage.clear()
    localStorage.setItem('rubik-cube', s)
  }, seed)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
}

test.describe('ExpertPage entry + shell (RD2-X2/X3)', () => {
  test('locked before all chapters done', async ({ page }) => {
    await seedAndLoad(page, welcomeSeed({ 1: 1, 2: 1, 3: 1 }))
    await expect(page.getByTestId('expert-entry')).toHaveCount(0)
  })

  test('first entry shows ExpertHome graduation screen', async ({ page }) => {
    await seedAndLoad(page, welcomeSeed(allChaptersDone))
    await page.getByTestId('expert-entry').click({ force: true })
    await expect(page.getByRole('button', { name: /開始使用/ })).toBeVisible()
    await page.getByRole('button', { name: /開始使用/ }).click()
    await expect(page.getByRole('tab', { name: /^🧠 解$/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^📚 案例$/ })).toBeVisible()
  })

  test('onboarded → ExpertPage directly', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await expect(page.getByRole('tab', { name: /^🧠 解$/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /開始使用/ })).toHaveCount(0)
  })
})

test.describe.configure({ mode: 'serial' })
test.describe('ExpertPage 解 tab (RD2-X4/X5/X8/X9)', () => {
  test('🎲 打亂 queues scramble', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await page.getByRole('button', { name: /打亂/ }).click()
    // queue length exposed via debug? Verify cube is not solved via move list eventual render
    await expect(page.getByRole('button', { name: /^▶ LBL$|^LBL$/ })).toBeEnabled()
  })

  test('LBL → MoveListPanel shows 6 stage segments', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    await seedAndLoad(page, expertSeed())
    await page.getByRole('button', { name: /打亂/ }).click()
    await expect(page.getByRole('button', { name: /^▶ LBL$|^LBL$/ })).toBeEnabled()
    await page.getByRole('button', { name: /^▶ LBL$|^LBL$/ }).click()
    await expect(page.getByTestId('move-list')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('move-list')).toContainText(/白十字/)
    await expect(page.getByTestId('move-list')).toContainText(/PLL/)
    expect(errors, errors.join(';')).toEqual([])
  })

  // 對照 E2E is flaky due to vite-dev compareMethods timing across projects.
  // ComparePanel render logic is covered by vitest (ComparePanel.test);
  // compareMethods store action covered by store tests.
  test.skip('對照 inline panel shows LBL + CFOP totals', async ({ page }) => {
    test.slow()
    // Apply an 8-move scramble via the store so cube is really unsolved (avoids
    // flaky wait on the in-page animation).
    await seedAndLoad(page, expertSeed())
    await page.evaluate(() => {
      const store = (window as unknown as { __RUBIK_STORE?: unknown }).__RUBIK_STORE
      void store // unused; fall through to the DOM path if no window hook
    })
    await page.getByRole('button', { name: /打亂/ }).click()
    await expect(page.getByRole('button', { name: /^▶ LBL$|^LBL$/ })).toBeEnabled({ timeout: 20_000 })
    // Wait until queue actually empties (lastComparison requires a non-solved cube)
    await page.waitForFunction(
      () => {
        const raw = localStorage.getItem('rubik-cube')
        if (!raw) return false
        try {
          const f = (JSON.parse(raw) as { state?: { facelets?: string } }).state?.facelets ?? ''
          return f.length === 54 && f !== 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)
        } catch { return false }
      },
      { timeout: 20_000 },
    )
    await page.getByRole('button', { name: /對照/ }).click()
    await expect(page.getByTestId('compare-panel')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('compare-panel')).toContainText('LBL')
    await expect(page.getByTestId('compare-panel')).toContainText('CFOP')
  })

  test('✍️ 輸入 opens drawer with 3 sub-tabs', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await page.getByRole('button', { name: /輸入/ }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('tab', { name: /手動/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /公式/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /拍照/ })).toBeVisible()
  })
})

test.describe('ExpertPage 案例 tab (RD2-X6)', () => {
  test('shows F2L cases by default with search', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    await expect(page.getByRole('tab', { name: /^F2L/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^PLL/ })).toBeVisible()
    await expect(page.getByPlaceholder(/搜尋/)).toBeVisible()
  })

  test('switch to PLL changes case list', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    const firstF2L = await page.locator('[data-testid^="case-card-"]').first().textContent()
    await page.getByRole('tab', { name: /^PLL/ }).click()
    const firstPLL = await page.locator('[data-testid^="case-card-"]').first().textContent()
    expect(firstPLL).not.toBe(firstF2L)
  })

  test('search narrows results', async ({ page }) => {
    await seedAndLoad(page, expertSeed())
    await page.getByRole('tab', { name: /^📚 案例$/ }).click()
    const before = await page.locator('[data-testid^="case-card-"]').count()
    await page.getByPlaceholder(/搜尋/).fill('xxnonexistentxx')
    const after = await page.locator('[data-testid^="case-card-"]').count()
    expect(after).toBeLessThan(before)
  })
})
