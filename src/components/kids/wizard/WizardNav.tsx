export function WizardNav({
  stepIdx, stepCount, isFirstStep, isLastStep, practiceDone, onPrev, onNext,
}: {
  stepIdx: number
  stepCount: number
  isFirstStep: boolean
  isLastStep: boolean
  practiceDone: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 mt-3">
      <button
        onClick={onPrev}
        disabled={isFirstStep}
        className="px-4 py-2 rounded-xl font-display text-sm disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        style={{
          background: 'white',
          color: 'var(--ink)',
          border: 'var(--border-mid)',
          boxShadow: isFirstStep ? 'none' : 'var(--offset-sm)',
        }}
      >
        ← 上一步
      </button>
      <div className="font-mono text-xs opacity-70 flex-shrink-0">
        {stepIdx + 1} / {stepCount}
      </div>
      <button
        onClick={onNext}
        disabled={!practiceDone}
        className="px-5 py-2 rounded-xl font-display text-base hover-wiggle disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        style={{
          background: 'var(--marker-yellow)',
          color: 'var(--ink)',
          border: 'var(--border-thick)',
          boxShadow: practiceDone ? 'var(--offset)' : 'none',
        }}
      >
        {isLastStep ? '✓ 完成本章' : '下一步 →'}
      </button>
    </div>
  )
}
