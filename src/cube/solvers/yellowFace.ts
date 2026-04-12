import { Cube } from '../Cube'
import { parseCubies, toFacelets, type CubieState } from '../cubies'
import { isYellowFaceSolved } from '../stages'
import { solve as solveFacelets } from '../solver'

/**
 * Yellow-face solver (runtime cubejs probe).
 *
 * Given the current cube has top two layers + yellow cross solved, the only
 * thing left for this phase is D-corner orientations. We construct an isolated
 * state with the same D-corner co pattern but everything else at identity, ask
 * cubejs for the optimal solve, and return that alg.
 *
 * The resulting alg necessarily affects only D-layer corners + possibly D
 * edges/permutation in ways that the subsequent PLL phase will correct.
 */
export async function solveYellowFace(cube: Cube): Promise<string[]> {
  if (isYellowFaceSolved(cube.facelets)) return []
  const current = parseCubies(cube.facelets)
  const isolated: CubieState = {
    cp: [0, 1, 2, 3, 4, 5, 6, 7],
    co: [0, 0, 0, 0, current.co[4], current.co[5], current.co[6], current.co[7]],
    ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const alg = await solveFacelets(toFacelets(isolated))
  return alg.trim().split(/\s+/).filter(Boolean)
}
