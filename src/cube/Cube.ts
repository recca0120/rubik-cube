/**
 * Rubik's Cube state model.
 *
 * Facelet encoding: 54 chars, face order URFDLB, each face row-major.
 * Indices: U 0-8, R 9-17, F 18-26, D 27-35, L 36-44, B 45-53.
 * Each face index layout:
 *   0 1 2
 *   3 4 5
 *   6 7 8
 */

export const SOLVED =
  'UUUUUUUUU' + 'RRRRRRRRR' + 'FFFFFFFFF' + 'DDDDDDDDD' + 'LLLLLLLLL' + 'BBBBBBBBB'

export type Move =
  | 'U' | "U'" | 'U2'
  | 'D' | "D'" | 'D2'
  | 'L' | "L'" | 'L2'
  | 'R' | "R'" | 'R2'
  | 'F' | "F'" | 'F2'
  | 'B' | "B'" | 'B2'

// Each basic CW move: list of 4-cycles (pos0 → pos1 → pos2 → pos3 → pos0)
const CW_CYCLES: Record<string, number[][]> = {
  U: [
    [0, 2, 8, 6], [1, 5, 7, 3],
    [18, 36, 45, 9], [19, 37, 46, 10], [20, 38, 47, 11],
  ],
  R: [
    [9, 11, 17, 15], [10, 14, 16, 12],
    [2, 51, 29, 20], [5, 48, 32, 23], [8, 45, 35, 26],
  ],
  F: [
    [18, 20, 26, 24], [19, 23, 25, 21],
    [6, 9, 29, 44], [7, 12, 28, 41], [8, 15, 27, 38],
  ],
  D: [
    [27, 29, 35, 33], [28, 32, 34, 30],
    [24, 15, 51, 42], [25, 16, 52, 43], [26, 17, 53, 44],
  ],
  L: [
    [36, 38, 44, 42], [37, 41, 43, 39],
    [0, 18, 27, 53], [3, 21, 30, 50], [6, 24, 33, 47],
  ],
  B: [
    [45, 47, 53, 51], [46, 50, 52, 48],
    [0, 42, 35, 11], [1, 39, 34, 14], [2, 36, 33, 17],
  ],
}

function applyCycles(facelets: string, cycles: number[][], times: number): string {
  const arr = [...facelets]
  for (let t = 0; t < times; t++) {
    const src = [...arr]
    for (const cyc of cycles) {
      for (let i = 0; i < cyc.length; i++) {
        const from = cyc[i]
        const to = cyc[(i + 1) % cyc.length]
        arr[to] = src[from]
      }
    }
  }
  return arr.join('')
}

export class Cube {
  readonly facelets: string

  constructor(facelets: string = SOLVED) {
    if (facelets.length !== 54) throw new Error('facelets must be 54 chars')
    this.facelets = facelets
  }

  isSolved(): boolean {
    return this.facelets === SOLVED
  }

  clone(): Cube {
    return new Cube(this.facelets)
  }

  apply(move: string): Cube {
    const face = move[0]
    const suffix = move.slice(1)
    const cycles = CW_CYCLES[face]
    if (!cycles) throw new Error(`unknown move: ${move}`)
    const times = suffix === "'" ? 3 : suffix === '2' ? 2 : suffix === '' ? 1 : NaN
    if (Number.isNaN(times)) throw new Error(`unknown move: ${move}`)
    return new Cube(applyCycles(this.facelets, cycles, times))
  }

  applyAlg(alg: string): Cube {
    return alg.trim().split(/\s+/).filter(Boolean).reduce((c, m) => c.apply(m), this as Cube)
  }

  static randomScramble(length = 25, rng: () => number = Math.random): string {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B']
    const suffixes = ['', "'", '2']
    const moves: string[] = []
    let lastFace = ''
    for (let i = 0; i < length; i++) {
      let f: string
      do { f = faces[Math.floor(rng() * 6)] } while (f === lastFace)
      lastFace = f
      moves.push(f + suffixes[Math.floor(rng() * 3)])
    }
    return moves.join(' ')
  }
}
