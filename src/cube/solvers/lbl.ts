/**
 * Integrated LBL solver with per-phase case-based sub-solvers.
 */

import { Cube } from '../Cube'
import { collapseMoves } from '../collapseMoves'
import { solve as solveFacelets, initSolver } from '../solver'
import {
  isTopTwoLayersSolved,
  isYellowCrossSolved,
  isYellowFaceSolved,
} from '../stages'
import { solveWhiteCross } from './whiteCross'
import { solveWhiteCorners } from './whiteCorners'

export type LBLSolution = {
  cross: string[]
  whiteCorners: string[]
  middleLayer: string[]
  yellowCross: string[]
  yellowFace: string[]
  pll: string[]
}

function applyMoves(cube: Cube, moves: string[]): Cube {
  return moves.reduce((c, m) => c.apply(m), cube)
}

/** Split an optimal solve (Kociemba) into middleLayer / yellowCross /
 *  yellowFace / pll segments by re-checking stage after each move. */
function splitByStage(startFacelets: string, moves: string[]): {
  middleLayer: string[]
  yellowCross: string[]
  yellowFace: string[]
  pll: string[]
} {
  const out = { middleLayer: [] as string[], yellowCross: [] as string[], yellowFace: [] as string[], pll: [] as string[] }
  let cube = new Cube(startFacelets)
  let phase: keyof typeof out = 'middleLayer'
  for (const m of moves) {
    cube = cube.apply(m)
    out[phase].push(m)
    const f = cube.facelets
    if (phase === 'middleLayer' && isTopTwoLayersSolved(f)) phase = 'yellowCross'
    else if (phase === 'yellowCross' && isYellowCrossSolved(f)) phase = 'yellowFace'
    else if (phase === 'yellowFace' && isYellowFaceSolved(f)) phase = 'pll'
  }
  return out
}

export async function lblSolve(cube: Cube): Promise<LBLSolution> {
  const cross = solveWhiteCross(cube)
  let state = applyMoves(cube, cross)

  const whiteCorners = solveWhiteCorners(state)
  state = applyMoves(state, whiteCorners)

  // RD3-1: from top-two-layers-pending state, use Kociemba for an optimal
  // ~20-move solve instead of 100+ moves of "safe" 3-cycle algs. Split the
  // resulting sequence back into LBL stages via stage predicates so
  // MoveListPanel / StageChipRow / segmentBoundaries still make sense.
  let split = { middleLayer: [] as string[], yellowCross: [] as string[], yellowFace: [] as string[], pll: [] as string[] }
  if (!state.isSolved()) {
    await initSolver()
    const rest = await solveFacelets(state.facelets)
    const restMoves = rest.trim().split(/\s+/).filter(Boolean)
    split = splitByStage(state.facelets, restMoves)
  }

  return {
    cross: collapseMoves(cross),
    whiteCorners: collapseMoves(whiteCorners),
    middleLayer: collapseMoves(split.middleLayer),
    yellowCross: collapseMoves(split.yellowCross),
    yellowFace: collapseMoves(split.yellowFace),
    pll: collapseMoves(split.pll),
  }
}

export function flatten(sol: LBLSolution): string[] {
  return [...sol.cross, ...sol.whiteCorners, ...sol.middleLayer, ...sol.yellowCross, ...sol.yellowFace, ...sol.pll]
}
