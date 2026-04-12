import { describe, it, expect } from 'vitest'
import { Cube, SOLVED } from './Cube'
import { annotate, stageDescription, STAGE_ORDER } from './lbl'

describe('annotate', () => {
  it('empty alg → no steps', () => {
    expect(annotate(SOLVED, [])).toEqual([])
  })

  it('produces one entry per move', () => {
    const result = annotate(SOLVED, ['R', 'U'])
    expect(result).toHaveLength(2)
    expect(result[0].move).toBe('R')
    expect(result[1].move).toBe('U')
  })

  it('tracks before/after stages', () => {
    // Start solved: applying R breaks everything → stage goes solved → start
    const result = annotate(SOLVED, ['R'])
    expect(result[0].before).toBe('solved')
    expect(result[0].after).toBe('start')
  })

  it('flags stage-advancing moves', () => {
    // Solving-direction: start with scrambled state, apply R' to revert.
    const scrambled = new Cube().apply('R').facelets
    const result = annotate(scrambled, ["R'"])
    expect(result[0].before).toBe('start')
    expect(result[0].after).toBe('solved')
    expect(result[0].stageReached).toBe('solved')
  })

  it('only marks stageReached when stage INDEX advances', () => {
    // Going backwards (from solved to start) should not set stageReached.
    const result = annotate(SOLVED, ['R'])
    expect(result[0].stageReached).toBeUndefined()
  })
})

describe('stageDescription', () => {
  it('returns non-empty text for every stage', () => {
    for (const s of STAGE_ORDER) {
      expect(stageDescription(s).length).toBeGreaterThan(0)
    }
  })
})
