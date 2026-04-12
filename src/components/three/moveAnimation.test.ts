import { describe, it, expect } from 'vitest'
import { parseMove } from './moveAnimation'

describe('parseMove', () => {
  it('returns null for empty / invalid input', () => {
    expect(parseMove(undefined)).toBeNull()
    expect(parseMove('')).toBeNull()
    expect(parseMove('X')).toBeNull()
    expect(parseMove('Uz')).toBeNull()
  })

  it('X2 parses as quarterTurns=2 (RD2-C13)', () => {
    const m = parseMove('U2')!
    expect(m).not.toBeNull()
    expect(m.quarterTurns).toBe(2)
    expect(m.axis).toBe('y')
  })

  it('X and X\' default to quarterTurns=1', () => {
    expect(parseMove('U')!.quarterTurns).toBe(1)
    expect(parseMove("R'")!.quarterTurns).toBe(1)
  })

  it('U maps to Y axis, CW looks negative (right-hand rule from +Y)', () => {
    const m = parseMove('U')!
    expect(m.axis).toBe('y')
    expect(m.sign).toBe(-1)
    expect(m.layer({ x: 0, y: 1, z: 0 })).toBe(true)
    expect(m.layer({ x: 0, y: 0, z: 0 })).toBe(false)
    expect(m.layer({ x: 0, y: -1, z: 0 })).toBe(false)
  })

  it("prime (') flips the sign", () => {
    expect(parseMove('U')!.sign).toBe(-1)
    expect(parseMove("U'")!.sign).toBe(1)
    expect(parseMove('D')!.sign).toBe(1)
    expect(parseMove("D'")!.sign).toBe(-1)
  })

  it.each([
    ['U', 'y', 1],
    ['D', 'y', -1],
    ['R', 'x', 1],
    ['L', 'x', -1],
    ['F', 'z', 1],
    ['B', 'z', -1],
  ] as const)('%s selects layer where %s === %i', (move, axis, val) => {
    const m = parseMove(move)!
    expect(m.axis).toBe(axis)
    const inLayer = { x: 0, y: 0, z: 0, [axis]: val } as { x: number; y: number; z: number }
    expect(m.layer(inLayer)).toBe(true)
    expect(m.layer({ x: 0, y: 0, z: 0 })).toBe(false)
  })

  it('opposite faces rotate in opposite directions for CW turns', () => {
    expect(parseMove('U')!.sign).toBe(-parseMove('D')!.sign)
    expect(parseMove('R')!.sign).toBe(-parseMove('L')!.sign)
    expect(parseMove('F')!.sign).toBe(-parseMove('B')!.sign)
  })
})
