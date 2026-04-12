import { inverseMove } from '@/store/cubeStore'

/** Invert a whole algorithm: reverse order + invert each move. */
export function invertAlg(alg: string): string {
  return alg.trim().split(/\s+/).filter(Boolean).reverse().map(inverseMove).join(' ')
}
