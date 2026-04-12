import type { F2LSlot } from './locate'

/**
 * Face remap for y^s (CW s × 90°, viewed from U):
 *   s=1: F→R, R→B, B→L, L→F  (U, D fixed)
 *   s=2: F↔B, R↔L
 *   s=3: F→L, L→B, B→R, R→F  (y')
 *
 * Used to execute a URF-frame F2L alg at other slots.
 */
const FACE_CYCLE = ['F', 'R', 'B', 'L'] as const

function remapFace(face: string, s: number): string {
  if (face === 'U' || face === 'D') return face
  const i = FACE_CYCLE.indexOf(face as (typeof FACE_CYCLE)[number])
  if (i < 0) return face
  return FACE_CYCLE[(i + s) % 4]
}

export function rotateMovesForSlot(moves: string[], slot: F2LSlot): string[] {
  if (slot === 0) return [...moves]
  return moves.map((m) => {
    const face = m[0]
    const suffix = m.slice(1)
    return remapFace(face, slot) + suffix
  })
}
