import type { FaceDir } from '@/cube/facelets'

export type Axis = 'x' | 'y' | 'z'
export type Pos = { x: number; y: number; z: number }

export type MoveAnim = {
  axis: Axis
  /** +1 or -1: rotation direction around the axis (Three.js right-hand rule). */
  sign: 1 | -1
  /** 1 = 90° quarter turn, 2 = 180° half turn. */
  quarterTurns: 1 | 2
  /** Predicate: does this cubie belong to the rotating layer? */
  layer: (c: Pos) => boolean
}

const AXIS_OF: Record<FaceDir, Axis> = { U: 'y', D: 'y', R: 'x', L: 'x', F: 'z', B: 'z' }
const CW_SIGN: Record<FaceDir, 1 | -1> = { U: -1, D: 1, R: -1, L: 1, F: -1, B: 1 }
const LAYER_VAL: Record<FaceDir, number> = { U: 1, D: -1, R: 1, L: -1, F: 1, B: -1 }

/**
 * Parse a move notation ("U", "U'", "U2") into the info needed to drive
 * a three.js layer-rotation animation.
 */
export function parseMove(move: string | undefined): MoveAnim | null {
  if (!move) return null
  const face = move[0] as FaceDir
  if (!(face in AXIS_OF)) return null
  const suffix = move.slice(1)
  if (suffix !== '' && suffix !== "'" && suffix !== '2') return null
  const prime = suffix === "'"
  const double = suffix === '2'
  const axis = AXIS_OF[face]
  const sign = (prime ? -CW_SIGN[face] : CW_SIGN[face]) as 1 | -1
  const val = LAYER_VAL[face]
  return { axis, sign, quarterTurns: double ? 2 : 1, layer: (c) => c[axis] === val }
}
