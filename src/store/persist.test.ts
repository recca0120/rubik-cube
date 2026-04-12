import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SOLVED } from '@/cube/Cube'

async function freshStore() {
  vi.resetModules()
  const mod = await import('./cubeStore')
  return mod.useCubeStore
}

describe('cubeStore persistence', () => {
  beforeEach(() => localStorage.clear())

  it('restores cube facelets from localStorage on reload', async () => {
    const storeA = await freshStore()
    storeA.getState().enqueue('R')
    storeA.getState().finishMove()
    const snapshot = storeA.getState().cube.facelets
    expect(snapshot).not.toBe(SOLVED)

    const storeB = await freshStore()
    expect(storeB.getState().cube.facelets).toBe(snapshot)
  })

  it('does not persist transient queue', async () => {
    const storeA = await freshStore()
    storeA.getState().enqueue("R U R'")

    const storeB = await freshStore()
    expect(storeB.getState().queue).toEqual([])
  })

  it('persists earnedStars across reload', async () => {
    const storeA = await freshStore()
    storeA.getState().awardStars(1, 3)
    storeA.getState().awardStars(2, 1)

    const storeB = await freshStore()
    expect(storeB.getState().earnedStars).toEqual({ 1: 3, 2: 1 })
  })

  it('persists wizardChapter + wizardStep + appMode', async () => {
    const storeA = await freshStore()
    storeA.getState().setAppMode('wizard')
    storeA.getState().setWizardChapter(3)
    storeA.getState().setWizardStep(2)

    const storeB = await freshStore()
    expect(storeB.getState().appMode).toBe('wizard')
    expect(storeB.getState().wizardChapter).toBe(3)
    expect(storeB.getState().wizardStep).toBe(2)
  })
})
