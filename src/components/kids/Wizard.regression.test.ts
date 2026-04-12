import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'Wizard.tsx'), 'utf8')

describe('Wizard wiring regression', () => {
  it('syncs step.highlight to store.setHighlightedPieces', () => {
    expect(source).toMatch(/setHighlightedPieces/)
    expect(source).toMatch(/step\.highlight/)
  })

  it('clears highlighted pieces when step has no highlight', () => {
    expect(source).toMatch(/setHighlightedPieces\(\s*step\.highlight\s*\?\?\s*null\s*\)/)
  })

  it('passes step.hint into CubieDialog (single narrator voice), not to WizardCubeStage', () => {
    expect(source).toMatch(/<CubieDialog[\s\S]*?hint=\{[^}]*step\.hint/)
    expect(source).not.toMatch(/<WizardCubeStage[^>]*hint=/)
  })

  it('uses two-column layout on md+ (cube left, narrator right)', () => {
    // Tailwind md:grid-cols-[...] pattern for responsive 2-col
    expect(source).toMatch(/md:grid-cols|md:flex-row/)
  })

  it('does not use the old fixed 55vh row-based layout', () => {
    expect(source).not.toMatch(/grid-rows-\[auto_55vh/)
  })

  it('pre-highlights demo face 800ms before enqueuing playMoves (show/walkthrough)', () => {
    // Must schedule enqueue via setTimeout with a visible delay
    expect(source).toMatch(/setTimeout[\s\S]{0,80}enqueue/)
    expect(source).toMatch(/setHighlightedFace\(/)
  })

  it('forces demo speed to 0.5× during show/walkthrough playMoves', () => {
    expect(source).toMatch(/setSpeed\(\s*0\.5\s*\)/)
  })

  it('applies step.preScramble (inverse alg) to put cube in the teaching-relevant state', () => {
    expect(source).toMatch(/preScramble/)
    expect(source).toMatch(/invertAlg/)
  })

  it('forces step-by-step playback during demos (each move auto-pauses)', () => {
    expect(source).toMatch(/setStepByStep\(\s*true\s*\)/)
    expect(source).toMatch(/setPaused\(\s*true\s*\)/)
  })

  it('renders WizardMiniPlayer during a demo playback', () => {
    expect(source).toMatch(/<WizardMiniPlayer/)
  })

  it('swaps CubieDialog message to current-move narration when demo in flight', () => {
    // must read friendlyMove or stepNarrations for dynamic dialog
    expect(source).toMatch(/friendlyMove|stepNarrations/)
  })
})
