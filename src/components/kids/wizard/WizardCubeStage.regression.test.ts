import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'WizardCubeStage.tsx'), 'utf8')

describe('WizardCubeStage', () => {
  it('camera pulled back enough on desktop so cube does not clip', () => {
    expect(source).toMatch(/position:\s*\[\s*[4-9]\.?\d*\s*,/)
    expect(source).toMatch(/fov:\s*(3[5-9]|4[0-2])\b/)
  })

  it('adds responsive padding on md+ so cube appears smaller on desktop', () => {
    expect(source).toMatch(/md:p-\d|md:px-\d|lg:p-\d|lg:px-\d/)
  })

  it('Wizard locks the view — no TrackballControls (users cannot orbit the cube)', () => {
    expect(source).not.toMatch(/TrackballControls/)
    expect(source).not.toMatch(/OrbitControls/)
  })
})
