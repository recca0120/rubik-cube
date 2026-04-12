import { describe, it, expect } from 'vitest'
import { Cube as OurCube } from './Cube'
import { Cube as CubejsCube } from './cubejs-shim'

describe('our Cube vs cubejs compatibility', () => {
  it('solved state matches', () => {
    expect(new OurCube().facelets).toBe(new CubejsCube().asString())
  })

  it.each([
    'U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'",
  ])('single move %s produces same facelets', (m) => {
    const ours = new OurCube().apply(m).facelets
    const theirs = new CubejsCube().move(m).asString()
    expect(ours).toBe(theirs)
  })

  it('scramble alg produces same state', () => {
    const alg = "R U R' U' F2 L D2 B"
    const ours = new OurCube().applyAlg(alg).facelets
    const theirs = new CubejsCube().move(alg).asString()
    expect(ours).toBe(theirs)
  })

  it('cubejs can solve our scrambled state end-to-end', () => {
    CubejsCube.initSolver()
    const alg = "R U R' U' F2 L D2 B"
    const ourFacelets = new OurCube().applyAlg(alg).facelets
    const solution = CubejsCube.fromString(ourFacelets).solve()
    expect(solution).toBeTruthy()
    const solved = new OurCube(ourFacelets).applyAlg(solution!)
    expect(solved.isSolved()).toBe(true)
  }, 15000)
})
