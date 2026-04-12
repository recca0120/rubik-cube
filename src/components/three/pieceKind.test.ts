import { describe, it, expect } from 'vitest'
import { pieceKind } from './pieceKind'

describe('pieceKind', () => {
  it('center pieces have exactly one non-zero axis', () => {
    expect(pieceKind(0, 1, 0)).toBe('center') // U
    expect(pieceKind(0, -1, 0)).toBe('center') // D
    expect(pieceKind(1, 0, 0)).toBe('center') // R
    expect(pieceKind(-1, 0, 0)).toBe('center') // L
    expect(pieceKind(0, 0, 1)).toBe('center') // F
    expect(pieceKind(0, 0, -1)).toBe('center') // B
  })

  it('edge pieces have exactly two non-zero axes', () => {
    expect(pieceKind(1, 1, 0)).toBe('edge') // UR
    expect(pieceKind(0, 1, 1)).toBe('edge') // UF
    expect(pieceKind(-1, -1, 0)).toBe('edge') // DL
  })

  it('corner pieces have all three non-zero axes', () => {
    expect(pieceKind(1, 1, 1)).toBe('corner') // URF
    expect(pieceKind(-1, -1, -1)).toBe('corner') // DLB
    expect(pieceKind(1, -1, 1)).toBe('corner') // DRF
  })
})
