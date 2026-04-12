// cubejs 是 UMD 寫法，在 ESM strict mode 下 `this` = undefined 會炸。
// 這裡用 new Function（sloppy mode）執行原始碼，並提供受控的 module/require。
import cubeSrc from 'cubejs/lib/cube.js?raw'
import solveSrc from 'cubejs/lib/solve.js?raw'

type CubeCtor = {
  new (): CubeInstance
  fromString(s: string): CubeInstance
  random(): CubeInstance
  scramble(): string
  initSolver(): void
}
type CubeInstance = {
  asString(): string
  solve(maxDepth?: number): string | null
  move(alg: string): CubeInstance
  isSolved(): boolean
  clone(): CubeInstance
}

function loadCubejs(): CubeCtor {
  const cubeModule = { exports: {} as unknown as CubeCtor }
  const cubeRequire = (id: string) => {
    if (id === './cube') return cubeModule.exports
    throw new Error(`unexpected require: ${id}`)
  }
  // cube.js: sloppy-mode fn; `this` defaults to globalThis, but module.exports path hits first
  new Function('module', 'exports', 'require', cubeSrc)(cubeModule, cubeModule.exports, cubeRequire)
  const Cube = cubeModule.exports

  // solve.js augments Cube.prototype. It does `Cube = this.Cube || require('./cube')`.
  // We expose Cube via `this` by calling with Cube class as this-binding of an outer wrapper.
  const solveWrapper = new Function('module', 'exports', 'require', solveSrc)
  solveWrapper.call({ Cube }, { exports: {} }, {}, cubeRequire)

  return Cube
}

export const Cube = loadCubejs()
