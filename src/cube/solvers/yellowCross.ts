import { Cube } from '../Cube'
import { isYellowCrossSolved } from '../stages'

/**
 * Yellow-cross solver (case-based).
 *
 * Algs derived via cubejs on isolated states where only D-edge orientations
 * were flipped (from identity state). Verified each alg has a clean π:
 * preserves top-two-layer pieces AND D-layer corners, only permutes D edges.
 *
 * Pattern key = orientation of D edges at slot order (DF, DL, DR, DB),
 * where 1 = D sticker on D face (oriented), 0 = not.
 *   All "0,0,0,0" = dot, "1,1,1,1" = solved,
 *   two opposite 1s = line, two adjacent 1s = L.
 */

function crossPattern(f: string): string {
  return [28, 30, 32, 34].map((i) => (f[i] === 'D' ? 1 : 0)).join(',')
}

const ALGS: Record<string, string[]> = {
  '1,1,1,1': [],
  // dot
  '0,0,0,0': "R L' F2 D2 F R L F2 B2 L2 U2 R2 B2 L2 D' R2 B2 R2 B2 D2".split(/\s+/),
  // line (DF+DB oriented → LR axis broken)
  '1,0,0,1': "R U D' F D2 F' U' D R F2 R2 F2 D2 F2 R2 F2 R2".split(/\s+/),
  // line (DL+DR oriented → FB axis broken)
  '0,1,1,0': "R F' U' B2 R' U2 F' D L U L2 U R2 U R2 D' F2 U L2 D' L2 U'".split(/\s+/),
  // L shapes (two adjacent oriented)
  '0,1,0,1': "R' L F' R2 F R L U' F2 L2 B2 D' R2 B2 U' R2 U".split(/\s+/),
  '0,0,1,1': "R F' R F2 L' F L U R2 L2 U' B2 R2 D' F2 U L2 U' R2 D B2".split(/\s+/),
  '1,0,1,0': "R L' F' D2 F R L U' B2 R2 F2 D' L2 F2 D' B2 D".split(/\s+/),
  '1,1,0,0': "R F L' D2 L F' R U' R2 D' F2 D B2 D' F2 D R2 U R2".split(/\s+/),
}

export function solveYellowCross(cube: Cube): string[] {
  if (isYellowCrossSolved(cube.facelets)) return []
  const pattern = crossPattern(cube.facelets)
  const alg = ALGS[pattern]
  if (!alg) throw new Error(`unknown yellow-cross pattern: ${pattern}`)
  return alg
}
