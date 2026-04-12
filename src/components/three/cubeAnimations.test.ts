import { describe, it, expect } from 'vitest'
import { pulseIntensity, idleRotationSpeed } from './cubeAnimations'

describe('pulseIntensity', () => {
  it('centers on 0.4 at t=0 (sin(0)=0)', () => {
    expect(pulseIntensity(0)).toBeCloseTo(0.4, 5)
  })

  it('peaks near 0.6 when sin term = 1', () => {
    // sin(ωt) = 1 when ωt = π/2 → t = π/(2ω). With ω=3: t = π/6
    expect(pulseIntensity(Math.PI / 6)).toBeCloseTo(0.6, 5)
  })

  it('troughs near 0.2 when sin term = -1', () => {
    expect(pulseIntensity(Math.PI / 2)).toBeCloseTo(0.2, 5)
  })

  it('stays within [0.2, 0.6] for any t', () => {
    for (let t = 0; t < 10; t += 0.1) {
      const v = pulseIntensity(t)
      expect(v).toBeGreaterThanOrEqual(0.2 - 1e-9)
      expect(v).toBeLessThanOrEqual(0.6 + 1e-9)
    }
  })
})

describe('parseMoveDirection (RD2-C6)', () => {
  it('parses face + direction from a single move', async () => {
    const { parseMoveDirection } = await import('./cubeAnimations')
    expect(parseMoveDirection('R')).toEqual({ face: 'R', direction: 'cw' })
    expect(parseMoveDirection("R'")).toEqual({ face: 'R', direction: 'ccw' })
    expect(parseMoveDirection('R2')).toEqual({ face: 'R', direction: '180' })
    expect(parseMoveDirection('U')).toEqual({ face: 'U', direction: 'cw' })
  })

  it('returns null for empty/invalid input', async () => {
    const { parseMoveDirection } = await import('./cubeAnimations')
    expect(parseMoveDirection('')).toBeNull()
    expect(parseMoveDirection('X')).toBeNull() // not a face letter
  })
})

describe('idleRotationSpeed', () => {
  it('returns 0 when anything active (queue has moves)', () => {
    expect(idleRotationSpeed({ queueLength: 1, highlightedFace: null })).toBe(0)
  })

  it('returns 0 when a face is highlighted (user is practicing)', () => {
    expect(idleRotationSpeed({ queueLength: 0, highlightedFace: 'R' })).toBe(0)
  })

  it('returns a small positive number when idle + mode=sandbox', () => {
    const v = idleRotationSpeed({ queueLength: 0, highlightedFace: null, mode: 'sandbox' })
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(0.5)
  })

  it('returns 0 when mode=wizard even if otherwise idle', () => {
    expect(idleRotationSpeed({ queueLength: 0, highlightedFace: null, mode: 'wizard' })).toBe(0)
  })

  it('defaults (no mode) behave as sandbox (backwards compat)', () => {
    expect(idleRotationSpeed({ queueLength: 0, highlightedFace: null })).toBeGreaterThan(0)
  })
})
