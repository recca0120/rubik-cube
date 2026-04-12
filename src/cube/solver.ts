import SolverWorker from './solver.worker.ts?worker'

type Pending = { resolve: (s: string) => void; reject: (e: Error) => void }

let worker: Worker | null = null
let initPromise: Promise<void> | null = null
let nextId = 0
const pending = new Map<number, Pending>()

function getWorker(): Worker {
  if (!worker) {
    console.log('[solver] creating worker')
    worker = new SolverWorker()
    worker.onerror = (e) => console.error('[solver] worker error', e.message, e.filename, e.lineno)
    worker.onmessage = (e: MessageEvent<{ id: number; solution?: string; error?: string; ready?: boolean }>) => {
      console.log('[solver] message from worker', e.data)
      const p = pending.get(e.data.id)
      if (!p) return
      pending.delete(e.data.id)
      if (e.data.error) p.reject(new Error(e.data.error))
      else p.resolve(e.data.solution ?? '')
    }
  }
  return worker
}

export function initSolver(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve: () => resolve(), reject })
    getWorker().postMessage({ id, type: 'init' })
  })
  return initPromise
}

export function solve(facelets: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, type: 'solve', facelets })
  })
}
