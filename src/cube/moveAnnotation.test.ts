import { describe, it, expect } from 'vitest'
import { annotateMove, FACE_NAMES } from './moveAnnotation'

describe('annotateMove', () => {
  it.each([
    ['U', '頂面', '順時針 90°'],
    ["U'", '頂面', '逆時針 90°'],
    ['U2', '頂面', '180°'],
    ['D', '底面', '順時針 90°'],
    ['R', '右面', '順時針 90°'],
    ["L'", '左面', '逆時針 90°'],
    ['F2', '前面', '180°'],
    ['B', '後面', '順時針 90°'],
  ])('annotateMove(%s) → "%s %s"', (move, face, direction) => {
    const annotation = annotateMove(move)!
    expect(annotation.face).toBe(face)
    expect(annotation.direction).toBe(direction)
  })

  it('text combines face + direction in Chinese', () => {
    expect(annotateMove("R'")?.text).toBe('逆時針 90° 轉右面')
    expect(annotateMove('U2')?.text).toBe('180° 轉頂面')
  })

  it('returns null for unknown move', () => {
    expect(annotateMove('')).toBeNull()
    expect(annotateMove('X')).toBeNull()
    expect(annotateMove('u')).toBeNull() // lowercase
  })

  it('FACE_NAMES covers all 6 faces', () => {
    expect(Object.keys(FACE_NAMES).sort()).toEqual(['B', 'D', 'F', 'L', 'R', 'U'])
  })
})
