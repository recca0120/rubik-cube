import { Cube } from '../Cube'
import { solveWhiteCorners } from './whiteCorners'
import { solveMiddleLayer } from './middleLayer'

/**
 * F2L solver — returns a single move sequence that takes a cross-solved
 * cube to a top-two-layers-solved state.
 *
 * This first-iteration implementation composes the existing whiteCorners
 * and middleLayer solvers, producing an LBL-style "corners then edges"
 * sequence. A future iteration can detect proper F2L pair cases and insert
 * corner+edge simultaneously (the true CFOP style).
 */
export function solveF2L(cube: Cube): string[] {
  const corners = solveWhiteCorners(cube)
  let state = cube
  for (const m of corners) state = state.apply(m)
  const edges = solveMiddleLayer(state)
  return [...corners, ...edges]
}
