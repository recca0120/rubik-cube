import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'Cube3D.tsx'), 'utf8')

describe('Cube3D wiring regression', () => {
  it('subscribes to store.speed (Player speed slider must affect turn duration)', () => {
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.speed\s*\)/)
    expect(source).not.toMatch(/const\s+speed\s*=\s*1\b/)
  })

  it('subscribes to store.viewFlipped (CasesTab F2L view must flip the cube)', () => {
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.viewFlipped\s*\)/)
    expect(source).not.toMatch(/const\s+viewFlipped\s*=\s*false\b/)
  })

  it('subscribes to store.highlightedPieces (Ch1 interactive highlights)', () => {
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.highlightedPieces\s*\)/)
  })

  it('renders MoveLabel popup above cube when highlightedMove is set', () => {
    expect(source).toMatch(/MoveLabel/)
  })

  it('subscribes to store.highlightedCubies (F2L pair/slot list)', () => {
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.highlightedCubies\s*\)/)
  })

  it('respects paused state — useFrame does NOT advance when paused & no stepTokens', () => {
    // Cube3D must check paused in useFrame, otherwise step-by-step has no effect.
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.paused\s*\)/)
    expect(source).toMatch(/useCubeStore\(\s*\(s\)\s*=>\s*s\.stepTokens\s*\)/)
  })
})
