import { describe, it, expect, beforeEach } from 'vitest'
import { useCubeStore, inverseMove } from './cubeStore'
import { SOLVED } from '@/cube/Cube'

function resetStore() {
  useCubeStore.getState().reset()
  useCubeStore.setState({
    appMode: 'welcome',
    wizardChapter: 1,
    wizardStep: 0,
    earnedStars: {},
  })
}

describe('cubeStore (v2)', () => {
  beforeEach(resetStore)

  it('starts solved with empty queue + history', () => {
    const s = useCubeStore.getState()
    expect(s.cube.facelets).toBe(SOLVED)
    expect(s.queue).toEqual([])
    expect(s.history).toEqual([])
  })

  describe('enqueue', () => {
    it('splits an alg into moves', () => {
      useCubeStore.getState().enqueue("R U R'")
      expect(useCubeStore.getState().queue).toEqual(['R', 'U', "R'"])
    })

    it('keeps X2 atomic in the queue (RD2-C13)', () => {
      useCubeStore.getState().enqueue('R2')
      expect(useCubeStore.getState().queue).toEqual(['R2'])
    })
  })

  describe('finishMove', () => {
    it('applies head of queue to cube + appends to history', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      const s = useCubeStore.getState()
      expect(s.queue).toEqual([])
      expect(s.history).toEqual(['R'])
      expect(s.cube.facelets).not.toBe(SOLVED)
    })

    it('is a no-op on empty queue', () => {
      useCubeStore.getState().finishMove()
      expect(useCubeStore.getState().history).toEqual([])
    })
  })

  describe('scramble', () => {
    it('enqueues at least 25 expanded moves', () => {
      useCubeStore.getState().scramble()
      expect(useCubeStore.getState().queue.length).toBeGreaterThanOrEqual(25)
    })

    it('clears history', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      useCubeStore.getState().scramble()
      expect(useCubeStore.getState().history).toEqual([])
    })
  })

  describe('reset', () => {
    it('restores solved state and clears queue + history', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      useCubeStore.getState().reset()
      const s = useCubeStore.getState()
      expect(s.cube.facelets).toBe(SOLVED)
      expect(s.queue).toEqual([])
      expect(s.history).toEqual([])
    })
  })

  describe('undo', () => {
    it('reverses the last finished move and pops history', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      useCubeStore.getState().undo()
      const s = useCubeStore.getState()
      expect(s.cube.facelets).toBe(SOLVED)
      expect(s.history).toEqual([])
    })

    it('handles X2 as atomic self-inverse (RD2-C13)', () => {
      useCubeStore.getState().enqueue('R2')
      useCubeStore.getState().finishMove()
      // history: ['R2']; one undo reverts
      expect(useCubeStore.getState().history).toEqual(['R2'])
      useCubeStore.getState().undo()
      expect(useCubeStore.getState().cube.facelets).toBe(SOLVED)
    })

    it('is no-op on empty history', () => {
      useCubeStore.getState().undo()
      expect(useCubeStore.getState().history).toEqual([])
    })
  })

  describe('appMode', () => {
    it('defaults to welcome', () => {
      expect(useCubeStore.getState().appMode).toBe('welcome')
    })

    it('setAppMode switches between welcome / wizard / sandbox', () => {
      useCubeStore.getState().setAppMode('wizard')
      expect(useCubeStore.getState().appMode).toBe('wizard')
      useCubeStore.getState().setAppMode('sandbox')
      expect(useCubeStore.getState().appMode).toBe('sandbox')
    })
  })

  describe('wizard state', () => {
    it('setWizardChapter resets step to 0', () => {
      useCubeStore.setState({ wizardStep: 5 })
      useCubeStore.getState().setWizardChapter(3)
      const s = useCubeStore.getState()
      expect(s.wizardChapter).toBe(3)
      expect(s.wizardStep).toBe(0)
    })

    it('awardStars takes the max of existing + given', () => {
      useCubeStore.getState().awardStars(1, 2)
      useCubeStore.getState().awardStars(1, 1) // should not overwrite
      expect(useCubeStore.getState().earnedStars[1]).toBe(2)
      useCubeStore.getState().awardStars(1, 3)
      expect(useCubeStore.getState().earnedStars[1]).toBe(3)
    })
  })

  describe('notation toggle (RD2-C3)', () => {
    it('showNotation defaults to false', () => {
      expect(useCubeStore.getState().showNotation).toBe(false)
    })

    it('setShowNotation toggles', () => {
      useCubeStore.getState().setShowNotation(true)
      expect(useCubeStore.getState().showNotation).toBe(true)
    })
  })

  describe('sound (RD2-A1)', () => {
    it('soundEnabled defaults to false (opt-in)', () => {
      expect(useCubeStore.getState().soundEnabled).toBe(false)
    })

    it('setSoundEnabled toggles the flag', () => {
      useCubeStore.getState().setSoundEnabled(true)
      expect(useCubeStore.getState().soundEnabled).toBe(true)
      useCubeStore.getState().setSoundEnabled(false)
      expect(useCubeStore.getState().soundEnabled).toBe(false)
    })
  })

  describe('streak (RD2-M9)', () => {
    it('markActiveToday adds today YYYY-MM-DD to activeDates (idempotent)', () => {
      const today = new Date().toISOString().slice(0, 10)
      useCubeStore.getState().markActiveToday()
      useCubeStore.getState().markActiveToday()
      expect(useCubeStore.getState().activeDates).toContain(today)
      expect(useCubeStore.getState().activeDates.filter((d) => d === today)).toHaveLength(1)
    })

    it('activeDays7d returns count of distinct dates in last 7 days', () => {
      const today = new Date()
      const ymd = (offset: number) => {
        const d = new Date(today)
        d.setDate(d.getDate() - offset)
        return d.toISOString().slice(0, 10)
      }
      useCubeStore.setState({ activeDates: [ymd(0), ymd(2), ymd(5), ymd(10)] })
      expect(useCubeStore.getState().activeDays7d()).toBe(3)
    })

    it('activeDays7d returns 0 for empty', () => {
      useCubeStore.setState({ activeDates: [] })
      expect(useCubeStore.getState().activeDays7d()).toBe(0)
    })

    it('markActiveToday prunes dates older than 30 days', () => {
      const old = new Date()
      old.setDate(old.getDate() - 40)
      useCubeStore.setState({ activeDates: [old.toISOString().slice(0, 10)] })
      useCubeStore.getState().markActiveToday()
      const dates = useCubeStore.getState().activeDates
      expect(dates).not.toContain(old.toISOString().slice(0, 10))
    })
  })

  describe('stepBack (Player Prev — RD4-2)', () => {
    it('reverts cube + pops history + prepends move back to queue', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      expect(useCubeStore.getState().history).toEqual(['R'])
      useCubeStore.getState().stepBack()
      const s = useCubeStore.getState()
      expect(s.cube.facelets).toBe(SOLVED)
      expect(s.history).toEqual([])
      expect(s.queue[0]).toBe('R')
    })

    it('auto-pauses so the undone move does NOT immediately replay', () => {
      useCubeStore.getState().enqueue('R')
      useCubeStore.getState().finishMove()
      useCubeStore.setState({ paused: false })
      useCubeStore.getState().stepBack()
      expect(useCubeStore.getState().paused).toBe(true)
    })

    it('is a no-op on empty history', () => {
      useCubeStore.getState().stepBack()
      expect(useCubeStore.getState().history).toEqual([])
      expect(useCubeStore.getState().queue).toEqual([])
    })
  })

  describe('highlightedCubies (Ch10 F2L pair/slot)', () => {
    it('defaults to null', () => {
      expect(useCubeStore.getState().highlightedCubies).toBeNull()
    })
    it('setHighlightedCubies writes list of [x,y,z]', () => {
      useCubeStore.getState().setHighlightedCubies([[1, 1, 1], [1, -1, 1]])
      expect(useCubeStore.getState().highlightedCubies).toEqual([[1, 1, 1], [1, -1, 1]])
      useCubeStore.getState().setHighlightedCubies(null)
      expect(useCubeStore.getState().highlightedCubies).toBeNull()
    })
  })

  describe('highlightedPieces (Ch1 interactive)', () => {
    it('defaults to null', () => {
      expect(useCubeStore.getState().highlightedPieces).toBeNull()
    })
    it('setHighlightedPieces writes field', () => {
      useCubeStore.getState().setHighlightedPieces('centers')
      expect(useCubeStore.getState().highlightedPieces).toBe('centers')
      useCubeStore.getState().setHighlightedPieces(null)
      expect(useCubeStore.getState().highlightedPieces).toBeNull()
    })
  })

  describe('inverseMove', () => {
    it('R -> R', () => expect(inverseMove('R')).toBe("R'"))
    it("R' -> R", () => expect(inverseMove("R'")).toBe('R'))
    it('R2 -> R2 (self)', () => expect(inverseMove('R2')).toBe('R2'))
  })
})
