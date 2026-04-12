import { Cube } from '../Cube'
import { parseCubies, type CubieState } from '../cubies'
import { applyMove } from '../cubieMoves'
import { isTopTwoLayersSolved } from '../stages'

/**
 * Case-based middle-layer solver.
 *
 * Each insertion alg was derived by running cubejs against an isolated
 * state (target edge misplaced at DF slot 5, parity via 3-edge-cycle).
 * The resulting alg's permutation is a clean 3-cycle of edges only
 * (confirmed: no corners or cross edges disturbed), so these algs are
 * safe to use during the middle-layer phase.
 *
 * For each target (FR=8, FL=9, BL=10, BR=11) and each orientation at DF
 * (eo=0 or 1), we have an insertion alg that moves the edge from DF into
 * its target slot with eo=0.
 */
const INSERT: Record<number, Record<0 | 1, string[]>> = {
  // FR from DF slot
  8: {
    0: "R U' R2 L2 D R D' R2 L2 U R2".split(/\s+/),
    1: "R2 F' U2 R2 U2 F U2 D' F2 D F2 B2 D' F2 L2 D' F2 D2 B2".split(/\s+/),
  },
  // FL from DF slot
  9: {
    0: "D R U2 F2 U2 R U2 B2 U2 D' F2 D' F2 B2 D R2".split(/\s+/),
    1: "D2 F' R2 U2 L2 B R2 D' F2 R2 B2 U F2 L2 U2 L2 F2 R2".split(/\s+/),
  },
  // BL from DF slot
  10: {
    0: "D R' U2 F2 D2 L B2 D2 L2 U' L2 U' F2 R2 B2 D' B2 D2".split(/\s+/),
    1: "F U2 R2 D2 B U F2 R2 U2 L2 B2 U2 R2 U' R2 U2".split(/\s+/),
  },
  // BR from DF slot
  11: {
    0: "R' U' R2 L2 D R U D' F2 U' R2 L2 D B2 U D'".split(/\s+/),
    1: "F' U2 R2 U2 F U D' F2 D' L2 U2 L2 D2 F2 R2 U' R2".split(/\s+/),
  },
}

// D-slot indices: DR=4, DF=5, DL=6, DB=7
// D CW rotates cubies: slot 4→5→6→7→4 (front rotates to left viewed from below)
function dRotateToSlot5(fromSlot: number): string[] {
  if (fromSlot < 4 || fromSlot > 7) return []
  const steps = ((5 - fromSlot) % 4 + 4) % 4
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

function placeOne(start: CubieState, target: number): string[] {
  if (start.ep[target] === target && start.eo[target] === 0) return []

  let s = start
  const moves: string[] = []

  // If target cubie is in middle layer (E-slot) but wrong, eject to D first.
  let loc = s.ep.indexOf(target)
  if (loc >= 8 && loc <= 11) {
    // Apply insertion alg targeting this slot — kicks whatever's there to D.
    // Pick the eo=0 variant of THAT slot (happens to be a 3-cycle that evicts).
    const ejectAlg = INSERT[loc][0]
    moves.push(...ejectAlg)
    s = applyMoves(s, ejectAlg)
    loc = s.ep.indexOf(target)
  }

  // Now target should be in D layer (slots 4-7). D-rotate to slot 5.
  if (loc < 4 || loc > 7) {
    throw new Error(`middle edge ${target} not in D layer after eject: loc=${loc}`)
  }
  const dMoves = dRotateToSlot5(loc)
  moves.push(...dMoves)
  s = applyMoves(s, dMoves)

  // Now target at slot 5. Apply insertion alg based on eo.
  const ori = s.eo[5] as 0 | 1
  const insert = INSERT[target][ori]
  moves.push(...insert)

  return moves
}

export function solveMiddleLayer(cube: Cube): string[] {
  if (isTopTwoLayersSolved(cube.facelets)) return []
  let state = parseCubies(cube.facelets)
  const moves: string[] = []
  for (let target = 8; target <= 11; target++) {
    for (let attempt = 0; attempt < 8; attempt++) {
      if (state.ep[target] === target && state.eo[target] === 0) break
      const sub = placeOne(state, target)
      if (sub.length === 0) break
      for (const m of sub) state = applyMove(state, m)
      moves.push(...sub)
    }
    if (state.ep[target] !== target || state.eo[target] !== 0) {
      throw new Error(`failed to place middle edge ${target}`)
    }
  }
  return moves
}
