/**
 * Layer-by-Layer stage predicates.
 *
 * Convention: white = U (top), yellow = D (bottom).
 * Stages progress bottom-up on the U face, then top-down on the D face:
 *   start → whiteCross → whiteFace → topTwoLayers → yellowCross → yellowFace → solved
 */

import { SOLVED } from './Cube'

/** Indices of the four top-layer edge stickers on U (non-corner, non-center). */
const U_EDGE_INDICES = [1, 3, 5, 7]

/** Side-top rows adjacent to U layer (top row of R/F/L/B). */
const SIDE_TOP_ROWS = [
  [9, 10, 11], // R top
  [18, 19, 20], // F top
  [36, 37, 38], // L top
  [45, 46, 47], // B top
]

const SIDE_MIDDLE_ROWS = [
  [12, 13, 14], // R middle
  [21, 22, 23], // F middle
  [39, 40, 41], // L middle
  [48, 49, 50], // B middle
]

const D_EDGE_INDICES = [28, 30, 32, 34] // D face edges

export function isWhiteCrossSolved(f: string): boolean {
  // Centers define colors; require each U edge = U and its side partner matches the side's center.
  if (U_EDGE_INDICES.some((i) => f[i] !== 'U')) return false
  // UB / UL / UR / UF side stickers must match B / L / R / F centers respectively.
  const sides: [number, string][] = [
    [46, f[49]],
    [37, f[40]],
    [10, f[13]],
    [19, f[22]],
  ]
  return sides.every(([idx, center]) => f[idx] === center)
}

export function isWhiteFaceSolved(f: string): boolean {
  if (!isWhiteCrossSolved(f)) return false
  // Whole U face = U
  for (let i = 0; i < 9; i++) if (f[i] !== 'U') return false
  // And the top row of every side must all match that side's center (corners + edges)
  for (const row of SIDE_TOP_ROWS) {
    const center = f[row[1] + 3] // side face center is 4 from top-middle in its 9-block
    if (!row.every((idx) => f[idx] === center)) return false
  }
  return true
}

export function isTopTwoLayersSolved(f: string): boolean {
  if (!isWhiteFaceSolved(f)) return false
  for (const row of SIDE_MIDDLE_ROWS) {
    const center = f[row[1]]
    if (!row.every((idx) => f[idx] === center)) return false
  }
  return true
}

export function isYellowCrossSolved(f: string): boolean {
  return D_EDGE_INDICES.every((i) => f[i] === 'D')
}

export function isYellowFaceSolved(f: string): boolean {
  for (let i = 27; i < 36; i++) if (f[i] !== 'D') return false
  return true
}

export function isCubeSolved(f: string): boolean {
  return f === SOLVED
}

export const STAGES = [
  'start',
  'whiteCross',
  'whiteFace',
  'topTwoLayers',
  'yellowCross',
  'yellowFace',
  'solved',
] as const
export type Stage = (typeof STAGES)[number]

/** Returns the furthest completed stage. */
export function currentStage(f: string): Stage {
  if (isCubeSolved(f)) return 'solved'
  if (isYellowFaceSolved(f)) return 'yellowFace'
  if (isYellowCrossSolved(f) && isTopTwoLayersSolved(f)) return 'yellowCross'
  if (isTopTwoLayersSolved(f)) return 'topTwoLayers'
  if (isWhiteFaceSolved(f)) return 'whiteFace'
  if (isWhiteCrossSolved(f)) return 'whiteCross'
  return 'start'
}
