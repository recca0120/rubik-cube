import { useCubeStore } from '@/store/cubeStore'
import { CHAPTERS, type WizardPhase } from '../wizardChapters'

const PHASE_LABEL: Record<WizardPhase, string> = {
  show: '👀 看示範',
  walkthrough: '🐢 慢慢看',
  guided: '🎯 換你做',
  free: '🚀 自己來',
}

export function WizardHeader({
  chapterId, chapterTitle, stepIdx, stepCount, phase, onExit,
}: {
  chapterId: number
  chapterTitle: string
  stepIdx: number
  stepCount: number
  phase: WizardPhase
  onExit: () => void
}) {
  return (
    <header
      className="px-4 py-3 flex items-center justify-between"
      style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
    >
      <div>
        <div className="text-xs font-mono opacity-70">
          Chapter {chapterId} / {CHAPTERS.length}
        </div>
        <div className="font-display text-xl">{chapterTitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono opacity-70">
          Step {stepIdx + 1} / {stepCount}
        </div>
        <span
          data-testid="phase-badge"
          className="text-xs px-2 py-1 rounded-full font-display"
          style={{ background: 'var(--paper-deep)', color: 'var(--ink)', border: '1.5px solid var(--ink)' }}
        >
          {PHASE_LABEL[phase]}
        </span>
        <button
          data-testid="wizard-sandbox-chip"
          onClick={() => useCubeStore.getState().setAppMode('sandbox')}
          className="text-xs font-display px-2 py-1 rounded-full"
          style={{
            background: 'white',
            color: 'var(--ink)',
            border: '1.5px solid var(--ink)',
            boxShadow: 'var(--offset-sm)',
          }}
          title="去自由玩"
        >
          🎮
        </button>
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl font-display text-sm"
          style={{
            background: 'var(--marker-pink)',
            color: 'var(--ink)',
            border: 'var(--border-mid)',
            boxShadow: 'var(--offset-sm)',
          }}
          title="回首頁"
        >
          🏠 回首頁
        </button>
      </div>
    </header>
  )
}
