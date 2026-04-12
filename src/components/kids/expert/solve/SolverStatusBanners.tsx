import { useCubeStore } from '@/store/cubeStore'

export function SolverStatusBanners() {
  const solverReady = useCubeStore((s) => s.solverReady)
  const solverError = useCubeStore((s) => s.solverError)
  const clearSolverError = useCubeStore((s) => s.clearSolverError)

  return (
    <>
      {!solverReady && (
        <div
          data-testid="solver-warming"
          className="px-4 py-2 text-xs font-body text-center"
          style={{ background: 'var(--paper-deep)', borderBottom: '1.5px solid var(--ink)' }}
        >
          🔧 準備解算器... 第一次進來需要幾秒
        </div>
      )}
      {solverError && (
        <div
          data-testid="solver-error"
          className="px-4 py-2 flex items-center gap-2"
          style={{ background: 'var(--marker-red)', color: 'white', borderBottom: '1.5px solid var(--ink)' }}
        >
          <span className="font-display text-sm flex-1">⚠️ {solverError}</span>
          <button
            onClick={clearSolverError}
            className="text-xs font-display px-2 py-1 rounded-full"
            style={{ background: 'white', color: 'var(--ink)', border: '1.5px solid var(--ink)' }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
