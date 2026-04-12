import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'Cubie3D.tsx'), 'utf8')

describe('Cubie3D highlight strategy (teaching-mode)', () => {
  it('bounces highlighted cubies (useFrame adjusts y position via sin)', () => {
    expect(source).toMatch(/useFrame/)
    expect(source).toMatch(/Math\.sin/)
    expect(source).toMatch(/position\.y/)
  })

  it('renders a ✨ sparkle sprite above highlighted cubies', () => {
    expect(source).toMatch(/✨/)
    // Must be gated on highlight
    expect(source).toMatch(/\{highlight\s*&&/)
  })

  it('has no transparency / opacity dimming', () => {
    expect(source).not.toMatch(/transparent:\s*true/)
    expect(source).not.toMatch(/opacity:\s*0\.\d/)
  })
})
