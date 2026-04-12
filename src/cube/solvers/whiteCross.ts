import { Cube } from '../Cube'
import { isWhiteCrossSolved } from '../stages'
import { buildCrossTable, lookupNextMove } from './crossTable'

/**
 * White-cross solver via precomputed lookup table.
 *
 * The table is built once on first use (~10s, ~190K entries). Each solve is
 * O(depth) lookups and applies — typically 4-8 moves, ≤ 1 ms total.
 */
export function solveWhiteCross(cube: Cube): string[] {
  if (isWhiteCrossSolved(cube.facelets)) return []
  const table = buildCrossTable()
  const moves: string[] = []
  let current = cube
  // At most 8 (God's number for cross is 8 HTM).
  for (let i = 0; i < 12 && !isWhiteCrossSolved(current.facelets); i++) {
    const m = lookupNextMove(current, table)
    if (!m) break
    moves.push(m)
    current = current.apply(m)
  }
  if (!isWhiteCrossSolved(current.facelets)) {
    throw new Error('cross table lookup failed — state not in table')
  }
  return moves
}
