import { useCubeStore } from '@/store/cubeStore'

type Props = {
  total: number
  done: number
  onRestart: () => void
}

/** Mini player for demo playback: prev / play-all / next / restart. */
export function WizardMiniPlayer({ total, done, onRestart }: Props) {
  const stepBack = useCubeStore((s) => s.stepBack)
  const stepOnce = useCubeStore((s) => s.stepOnce)
  const setPaused = useCubeStore((s) => s.setPaused)
  const setStepByStep = useCubeStore((s) => s.setStepByStep)
  const historyLen = useCubeStore((s) => s.history.length)
  const queueLen = useCubeStore((s) => s.queue.length)

  const canBack = historyLen > 0
  const canNext = queueLen > 0

  return (
    <div
      data-testid="wizard-mini-player"
      className="flex items-center justify-center gap-1.5 flex-wrap text-xs font-display"
    >
      <button
        onClick={stepBack}
        disabled={!canBack}
        title="上一步"
        className="px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-40"
        style={{ background: 'white', border: '1.5px solid var(--ink)', boxShadow: canBack ? 'var(--offset-sm)' : 'none' }}
      >⏮</button>
      <button
        onClick={() => { setStepByStep(false); setPaused(false) }}
        disabled={!canNext}
        title="自動播放"
        className="px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-40"
        style={{ background: 'var(--marker-yellow)', border: '1.5px solid var(--ink)', boxShadow: canNext ? 'var(--offset-sm)' : 'none' }}
      >▶ 自動</button>
      <button
        onClick={stepOnce}
        disabled={!canNext}
        title="下一步"
        className="px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-40"
        style={{ background: 'white', border: '1.5px solid var(--ink)', boxShadow: canNext ? 'var(--offset-sm)' : 'none' }}
      >⏭</button>
      <button
        onClick={onRestart}
        title="從頭再看"
        className="px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
        style={{ background: 'white', border: '1.5px solid var(--ink)', boxShadow: 'var(--offset-sm)' }}
      >🔄</button>
      <span className="font-mono text-xs opacity-70 ml-1">{done} / {total}</span>
    </div>
  )
}
