export type CubieState = {
  cp: number[] // corner permutation: cp[slot] = cubie index currently at that slot
  co: number[] // corner orientation: 0/1/2 (# CW rotations needed to align U/D sticker)
  ep: number[] // edge permutation
  eo: number[] // edge orientation: 0/1
}

// Facelet indices for each corner slot, in (principal, cw1, cw2) order.
// Principal is the U-face or D-face position of that slot.
const CORNER_FACELETS: readonly (readonly [number, number, number])[] = [
  [8, 9, 20], // URF
  [6, 18, 38], // UFL
  [0, 36, 47], // ULB
  [2, 45, 11], // UBR
  [29, 26, 15], // DFR
  [27, 44, 24], // DLF
  [33, 53, 42], // DBL
  [35, 17, 51], // DRB
]

// Color triples for each corner cubie (sorted for set identity).
const CORNER_IDS = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'].map((s) =>
  [...s].sort().join(''),
)

// Facelet indices for each edge slot, in (principal, other) order.
// Principal is the U/D-face position, or the F/B-face position for middle-layer edges.
const EDGE_FACELETS: readonly (readonly [number, number])[] = [
  [5, 10], // UR
  [7, 19], // UF
  [3, 37], // UL
  [1, 46], // UB
  [32, 16], // DR
  [28, 25], // DF
  [30, 43], // DL
  [34, 52], // DB
  [23, 12], // FR
  [21, 41], // FL
  [50, 39], // BL
  [48, 14], // BR
]

const EDGE_IDS = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'].map((s) =>
  [...s].sort().join(''),
)

/** For a given edge cubie index, which of its two letters is the "principal" color. */
const EDGE_PRINCIPAL = ['U', 'U', 'U', 'U', 'D', 'D', 'D', 'D', 'F', 'F', 'B', 'B']

// Color triples per corner cubie in CW-around-corner order (principal, cw1, cw2).
// CW order is defined consistently with CORNER_FACELETS: slot i's facelet order
// matches the home cubie's color order when orientation = 0.
const CORNER_COLORS: readonly (readonly [string, string, string])[] = [
  ['U', 'R', 'F'], // URF
  ['U', 'F', 'L'], // UFL
  ['U', 'L', 'B'], // ULB
  ['U', 'B', 'R'], // UBR
  ['D', 'F', 'R'], // DFR
  ['D', 'L', 'F'], // DLF
  ['D', 'B', 'L'], // DBL
  ['D', 'R', 'B'], // DRB
]

// Color pairs per edge cubie in (principal, other) order.
const EDGE_COLORS: readonly (readonly [string, string])[] = [
  ['U', 'R'], // UR
  ['U', 'F'], // UF
  ['U', 'L'], // UL
  ['U', 'B'], // UB
  ['D', 'R'], // DR
  ['D', 'F'], // DF
  ['D', 'L'], // DL
  ['D', 'B'], // DB
  ['F', 'R'], // FR
  ['F', 'L'], // FL
  ['B', 'L'], // BL
  ['B', 'R'], // BR
]

export function parseCubies(facelets: string): CubieState {
  const cp = new Array(8).fill(0)
  const co = new Array(8).fill(0)
  const ep = new Array(12).fill(0)
  const eo = new Array(12).fill(0)

  for (let slot = 0; slot < 8; slot++) {
    const pos = CORNER_FACELETS[slot]
    const stickers = [facelets[pos[0]], facelets[pos[1]], facelets[pos[2]]]
    const id = [...stickers].sort().join('')
    const cubie = CORNER_IDS.indexOf(id)
    if (cubie < 0) throw new Error(`unknown corner at slot ${slot}: ${stickers.join('')}`)
    cp[slot] = cubie
    // Orientation = index (0/1/2) of the U-or-D sticker within (principal, cw1, cw2).
    const udIdx = stickers.findIndex((c) => c === 'U' || c === 'D')
    if (udIdx < 0) throw new Error(`corner at slot ${slot} has no U/D sticker`)
    co[slot] = udIdx
  }

  for (let slot = 0; slot < 12; slot++) {
    const pos = EDGE_FACELETS[slot]
    const stickers = [facelets[pos[0]], facelets[pos[1]]]
    const id = [...stickers].sort().join('')
    const cubie = EDGE_IDS.indexOf(id)
    if (cubie < 0) throw new Error(`unknown edge at slot ${slot}: ${stickers.join('')}`)
    ep[slot] = cubie
    // Orientation 0 iff the cubie's principal-color sticker sits at the slot's principal position.
    eo[slot] = stickers[0] === EDGE_PRINCIPAL[cubie] ? 0 : 1
  }

  return { cp, co, ep, eo }
}

export function toFacelets(state: CubieState): string {
  const arr = new Array(54).fill('')
  // Face centers
  const centers: Record<number, string> = { 4: 'U', 13: 'R', 22: 'F', 31: 'D', 40: 'L', 49: 'B' }
  for (const [idx, c] of Object.entries(centers)) arr[+idx] = c

  for (let slot = 0; slot < 8; slot++) {
    const cubie = state.cp[slot]
    const orient = state.co[slot]
    const slotPositions = CORNER_FACELETS[slot]
    const cubieColors = CORNER_COLORS[cubie]
    // Cubie's sticker i ends up at slot position (i + orient) % 3
    // Equivalently, slot position j holds cubie sticker (j - orient + 3) % 3
    for (let j = 0; j < 3; j++) {
      arr[slotPositions[j]] = cubieColors[(j - orient + 3) % 3]
    }
  }

  for (let slot = 0; slot < 12; slot++) {
    const cubie = state.ep[slot]
    const orient = state.eo[slot]
    const slotPositions = EDGE_FACELETS[slot]
    const cubieColors = EDGE_COLORS[cubie]
    for (let j = 0; j < 2; j++) {
      arr[slotPositions[j]] = cubieColors[(j - orient + 2) % 2]
    }
  }

  return arr.join('')
}
