/**
 * E2E auto-play (RD2-V3).
 *
 * For every chapter that has practice (requireMoves) steps:
 *   1. Seed localStorage so first load drops straight into that step
 *   2. Click the highlighted keypad button in a loop
 *   3. Assert ✓ 太棒了 appears before the timeout
 *
 * If any practice step is broken (invalid move, unsatisfiable sequence,
 * keypad not receiving clicks, animation deadlock), the test fails with
 * the specific chapter/step.
 *
 * Kept lean: reuses wizardChapters data via a dynamic import so content
 * changes automatically get covered.
 */

import { test, expect, type Page } from '@playwright/test'
import { CHAPTERS, type WizardChapter } from '../src/components/kids/wizardChapters'

const SOLVED = 'U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9)

function seedFor(chapter: number, step: number): string {
  // All prior chapters starred so skill-graph unlocks the target chapter.
  const earnedStars: Record<number, number> = {}
  for (let i = 1; i < chapter; i++) earnedStars[i] = 1
  return JSON.stringify({
    state: {
      facelets: SOLVED,
      appMode: 'wizard',
      wizardChapter: chapter,
      wizardStep: step,
      earnedStars,
    },
    version: 0,
  })
}

async function loadAt(page: Page, chapter: number, step: number) {
  // Inject before the first navigation so the store's merge() sees the seed.
  await page.addInitScript((seed) => {
    localStorage.clear()
    localStorage.setItem('rubik-cube', seed)
  }, seedFor(chapter, step))
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600) // cube mount + Cubie typewriter settle
}

async function clickHighlightedKeypad(page: Page) {
  const btn = page.locator('[data-testid="move-keypad"] button[data-highlight="true"]').first()
  await expect(btn).toBeVisible({ timeout: 5000 })
  await btn.click({ force: true })
}

type PracticeTarget = {
  chapter: number
  chapterTitle: string
  stepIdx: number
  moves: string[]
}

function collectPractice(all: WizardChapter[]): PracticeTarget[] {
  const out: PracticeTarget[] = []
  for (const c of all) {
    c.steps.forEach((s, idx) => {
      if (s.requireMoves && s.requireMoves.length > 0) {
        out.push({
          chapter: c.id,
          chapterTitle: c.title,
          stepIdx: idx,
          moves: s.requireMoves,
        })
      }
    })
  }
  return out
}

const PRACTICE_TARGETS = collectPractice(CHAPTERS)

test.describe('wizard practice auto-play', () => {
  for (const target of PRACTICE_TARGETS) {
    test(`Ch${target.chapter} "${target.chapterTitle}" step ${target.stepIdx} — ${target.moves.join(' ')} completes`, async ({ page }) => {
      await loadAt(page, target.chapter, target.stepIdx)

      // phase badge should read 換你做 (guided phase inferred from requireMoves)
      await expect(page.getByTestId('phase-badge')).toContainText(/換你做|自己來/)

      // Click highlighted button once per required move, with slack for
      // animation ticks. requireMoves.length + 3 gives room for a stale
      // first-frame read before cube animation settles.
      const maxClicks = target.moves.length + 3
      for (let n = 0; n < maxClicks; n++) {
        const success = page.getByTestId('practice-success')
        if (await success.count()) break
        await clickHighlightedKeypad(page)
        await page.waitForTimeout(350) // 90° turn animation + React flush
      }

      await expect(page.getByTestId('practice-success'), {
        message: `Ch${target.chapter} step ${target.stepIdx} — ${target.moves.join(' ')} didn't satisfy after ${maxClicks} clicks`,
      }).toBeVisible({ timeout: 5000 })
      await expect(page.getByTestId('practice-success')).toContainText(/太棒了/)
    })
  }
})

test.describe('wizard non-practice rendering', () => {
  // Sanity: intro step of every chapter renders without JS errors.
  for (const c of CHAPTERS) {
    test(`Ch${c.id} "${c.title}" intro step loads without error`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))

      await loadAt(page, c.id, 0)
      await expect(page.getByTestId('phase-badge')).toBeVisible()
      expect(errors, `page errors on Ch${c.id}: ${errors.join('; ')}`).toEqual([])
    })
  }
})
