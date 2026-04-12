import { Cube } from '../Cube'
import { parseCubies, type CubieState } from '../cubies'
import { applyMove } from '../cubieMoves'
import { isWhiteFaceSolved } from '../stages'

/**
 * Case-based white-corner solver.
 *
 * For each target white corner (URF=0, UFL=1, ULB=2, UBR=3):
 *   1. If already at target with co=0, skip.
 *   2. If in U layer but wrong slot/orient, eject into D layer using the
 *      standard "(R U R' U')" sexy applied at that slot.
 *   3. D-rotate to place it below the target.
 *   4. Apply the insertion alg for the current orientation.
 *
 * Insertion algs were discovered by BFS probe (cross-preserving, shortest).
 * Each target's algs are rotations around the U axis of the URF-target algs.
 */

// Insertion algs indexed by [target][co]. Discovered via BFS with constraint:
// target placed AND cross preserved AND all OTHER white corners returning to
// their home slots with co=0.
const INSERT: Record<0 | 1 | 2 | 3, Record<0 | 1 | 2, string[]>> = {
  0: {
    0: ["R'", "F'", 'R2', 'F', 'R'],
    1: ['F', 'D', "F'"],
    2: ["R'", "D'", 'R'],
  },
  1: {
    0: ['L', 'F', 'L2', "F'", "L'"],
    1: ['L', 'D', "L'"],
    2: ["F'", "D'", 'F'],
  },
  2: {
    0: ["L'", "F'", 'D2', 'F', 'L'],
    1: ['B', 'D', "B'"],
    2: ["L'", "D'", 'L'],
  },
  3: {
    0: ['R', 'F', 'D2', "F'", "R'"],
    1: ['R', 'D', "R'"],
    2: ["B'", "D'", 'B'],
  },
}

// U-free eject algs (discovered via BFS probe): move whatever is at the
// given U-layer slot down to the D layer while preserving the cross.
const EJECT_FROM_U: Record<0 | 1 | 2 | 3, string[]> = {
  0: ["R'", 'D', 'R'],         // URF → D
  1: ['L', 'D', "L'"],         // UFL → D (actually observed as "L D L'")
  2: ["L'", 'D', 'L'],         // ULB → D
  3: ['R', 'D', "R'"],         // UBR → D
}

// Below-slot order matching target indices: URF→DFR, UFL→DLF, ULB→DBL, UBR→DRB.
const BELOW_SLOT = [4, 5, 6, 7] as const

// D permutation: when D turns CW (viewed from below, i.e. +90° around +Y axis),
// D-layer slots cycle as: DFR(4) → DLF(5) → DBL(6) → DRB(7) → DFR.
// Thus slot DFR+k (i.e. 4+k) after "D n times" sits at 4+((k+n) mod 4).
// To move cubie from slot s to slot t (both in D layer), turn D by (t-s) mod 4.
function dRotateMoves(fromSlot: number, toSlot: number): string[] {
  const steps = ((toSlot - fromSlot) % 4 + 4) % 4
  if (steps === 0) return []
  if (steps === 1) return ['D']
  if (steps === 2) return ['D2']
  return ["D'"]
}

function applyMoves(state: CubieState, moves: string[]): CubieState {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

function placeOne(start: CubieState, target: 0 | 1 | 2 | 3): string[] {
  const moves: string[] = []
  let s = start

  // Step 1: locate target cubie.
  let loc = s.cp.indexOf(target)

  // Step 2: if in U layer and already correct, done.
  if (loc === target && s.co[target] === 0) return []

  // Step 3: if in U layer (0..3) but wrong, eject to D layer.
  if (loc < 4) {
    const eject = EJECT_FROM_U[loc as 0 | 1 | 2 | 3]
    moves.push(...eject)
    s = applyMoves(s, eject)
    loc = s.cp.indexOf(target)
    if (loc < 4) {
      // Shouldn't happen; sexy always moves corner out of U layer if not at home.
      // Safety: try again via direct ejection after a U turn.
      moves.push('U')
      s = applyMove(s, 'U')
      loc = s.cp.indexOf(target)
    }
  }

  // Step 4: in D layer. D-rotate to place below the target.
  const below = BELOW_SLOT[target]
  const dMoves = dRotateMoves(loc, below)
  moves.push(...dMoves)
  s = applyMoves(s, dMoves)

  // Step 5: insert based on orientation.
  const ori = s.co[below] as 0 | 1 | 2
  const insert = INSERT[target][ori]
  moves.push(...insert)
  s = applyMoves(s, insert)

  return moves
}

export function solveWhiteCorners(cube: Cube): string[] {
  if (isWhiteFaceSolved(cube.facelets)) return []
  let state = parseCubies(cube.facelets)
  const moves: string[] = []
  for (let t = 0; t < 4; t++) {
    // Each corner may need multiple insertion cycles if it's ejected elsewhere
    // by the previous corner's insertion. Retry up to 8 times.
    let lastMoves = 0
    for (let attempt = 0; attempt < 8; attempt++) {
      if (state.cp[t] === t && state.co[t] === 0) break
      const sub = placeOne(state, t as 0 | 1 | 2 | 3)
      if (sub.length === 0) break
      for (const m of sub) state = applyMove(state, m)
      moves.push(...sub)
      if (moves.length === lastMoves) break // no progress
      lastMoves = moves.length
    }
    if (state.cp[t] !== t || state.co[t] !== 0) {
      const diag = `cp[${t}]=${state.cp[t]} co[${t}]=${state.co[t]} cp=${state.cp} co=${state.co}`
      throw new Error(`failed to place corner ${t}: ${diag}`)
    }
  }
  return moves
}
