import { Cube } from './cubejs-shim'

console.log('[solver.worker] loaded')

let ready = false

self.onmessage = (e: MessageEvent<{ id: number; type: 'init' | 'solve'; facelets?: string }>) => {
  const { id, type, facelets } = e.data
  console.log('[solver.worker] message', type)
  try {
    if (type === 'init' || !ready) {
      console.log('[solver.worker] initSolver start')
      Cube.initSolver()
      ready = true
      console.log('[solver.worker] initSolver done')
    }
    if (type === 'solve' && facelets) {
      const cube = Cube.fromString(facelets)
      const solution = cube.solve() ?? ''
      self.postMessage({ id, solution })
      return
    }
    self.postMessage({ id, ready: true })
  } catch (err) {
    console.error('[solver.worker] error', err)
    self.postMessage({ id, error: (err as Error).message })
  }
}
