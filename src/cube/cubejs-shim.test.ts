import { describe, it, expect } from 'vitest'
import { Cube } from './cubejs-shim'

describe('cubejs-shim', () => {
  it('exports a Cube class', () => {
    expect(Cube).toBeDefined()
    expect(typeof Cube).toBe('function')
  })

  it('new Cube() is solved', () => {
    const c = new Cube()
    expect(c.isSolved()).toBe(true)
    expect(c.asString()).toHaveLength(54)
  })

  it('asString produces URFDLB format', () => {
    expect(new Cube().asString()).toBe('U'.repeat(9) + 'R'.repeat(9) + 'F'.repeat(9) + 'D'.repeat(9) + 'L'.repeat(9) + 'B'.repeat(9))
  })

  it('move() applies algorithm', () => {
    const c = new Cube().move('R U')
    expect(c.isSolved()).toBe(false)
  })

  it('initSolver + solve() works', () => {
    Cube.initSolver()
    const scrambled = Cube.fromString(new Cube().move("R U R' U' F2 L").asString())
    const solution = scrambled.solve()
    expect(typeof solution).toBe('string')
    expect((solution ?? '').length).toBeGreaterThan(0)
    // Apply the solution and check it solves the cube
    const solved = scrambled.move(solution!)
    expect(solved.isSolved()).toBe(true)
  }, 15000)
})
