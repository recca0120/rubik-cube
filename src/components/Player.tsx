import { useCubeStore } from '@/store/cubeStore'
import { StickerButton } from './ui/StickerButton'

const SPEEDS = [0.5, 1, 2, 4]

export function Player() {
  const queue = useCubeStore((s) => s.queue)
  const paused = useCubeStore((s) => s.paused)
  const speed = useCubeStore((s) => s.speed)
  const total = useCubeStore((s) => s.totalProgram)
  const history = useCubeStore((s) => s.history)
  const togglePaused = useCubeStore((s) => s.togglePaused)
  const stepOnce = useCubeStore((s) => s.stepOnce)
  const stepBack = useCubeStore((s) => s.stepBack)
  const setSpeed = useCubeStore((s) => s.setSpeed)
  const stepByStep = useCubeStore((s) => s.stepByStep)
  const setStepByStep = useCubeStore((s) => s.setStepByStep)

  const done = total - queue.length
  const hasQueue = queue.length > 0
  const hasHistory = history.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickerButton onClick={stepBack} disabled={!hasHistory}>
          ⏮ Prev
        </StickerButton>
        <StickerButton
          onClick={togglePaused}
          disabled={!hasQueue}
          color="var(--marker-yellow)"
          styleOverride={{ border: 'var(--border-thick)', boxShadow: !hasQueue ? 'none' : 'var(--offset)' }}
        >
          {paused ? '▶ Play' : '⏸ Pause'}
        </StickerButton>
        <StickerButton onClick={stepOnce} disabled={!hasQueue}>
          Step →
        </StickerButton>
      </div>

      <label className="flex items-center gap-2 text-xs font-body cursor-pointer">
        <input
          type="checkbox"
          checked={stepByStep}
          onChange={(e) => setStepByStep(e.target.checked)}
          className="w-4 h-4"
        />
        每步暫停
      </label>

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-mono opacity-60 mr-1">速度</span>
        {SPEEDS.map((v) => (
          <button
            key={v}
            onClick={() => setSpeed(v)}
            className="px-2.5 py-1 rounded-full font-display text-xs active:scale-95 transition-transform"
            style={{
              background: speed === v ? 'var(--marker-blue)' : 'white',
              color: speed === v ? 'white' : 'var(--ink)',
              border: '1.5px solid var(--ink)',
              boxShadow: speed === v ? 'var(--offset-sm)' : 'none',
            }}
          >
            {v}×
          </button>
        ))}
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-mono opacity-70">
            進度 {done} / {total}
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--paper-deep)', border: '1.5px solid var(--ink)' }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${(done / total) * 100}%`,
                background: 'linear-gradient(90deg, var(--marker-yellow), var(--marker-red))',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

