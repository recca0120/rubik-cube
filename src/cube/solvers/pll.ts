import { Cube } from '../Cube'
import { parseCubies, toFacelets, type CubieState } from '../cubies'
import { solve as solveFacelets } from '../solver'

/**
 * PLL solver (runtime cubejs probe).
 *
 * After yellow face solved: top two layers solved, D-face all yellow. Only
 * D-layer permutations remain. We construct an isolated state capturing
 * just the D-layer cp+ep permutations (with cp/ep for slots 4-7 from current),
 * ask cubejs for optimal solve, return that alg.
 */
export async function solvePLL(cube: Cube): Promise<string[]> {
  if (cube.isSolved()) return []
  const current = parseCubies(cube.facelets)
  const isolated: CubieState = {
    cp: [0, 1, 2, 3, current.cp[4], current.cp[5], current.cp[6], current.cp[7]],
    co: [0, 0, 0, 0, 0, 0, 0, 0],
    ep: [0, 1, 2, 3, current.ep[4], current.ep[5], current.ep[6], current.ep[7], 8, 9, 10, 11],
    eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
  const alg = await solveFacelets(toFacelets(isolated))
  return alg.trim().split(/\s+/).filter(Boolean)
}
