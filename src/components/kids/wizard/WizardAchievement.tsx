export function WizardAchievement({
  chapterTitle, isLastChapter, onContinue, onHome,
}: {
  chapterTitle: string
  isLastChapter: boolean
  onContinue: () => void
  onHome: () => void
}) {
  return (
    <div
      data-testid="achievement-screen"
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      style={{ background: 'rgba(26,26,46,0.6)' }}
    >
      <div
        className="max-w-sm w-full rounded-3xl px-6 py-8 text-center anim-pop"
        style={{
          background: 'var(--paper)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--offset-lg)',
        }}
      >
        <div className="text-6xl mb-3">🎉</div>
        <div className="font-display text-2xl mb-2">你學會了</div>
        <div className="font-display text-3xl mb-4" style={{ color: 'var(--marker-red)' }}>
          {chapterTitle}
        </div>
        <div className="text-3xl mb-6">⭐ +1</div>
        <div className="flex flex-col gap-2">
          {!isLastChapter && (
            <button
              onClick={onContinue}
              className="px-5 py-3 rounded-xl font-display text-base hover-wiggle"
              style={{
                background: 'var(--marker-yellow)',
                color: 'var(--ink)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--offset)',
              }}
            >
              下一章 →
            </button>
          )}
          <button
            onClick={onHome}
            className="px-4 py-2 rounded-xl font-display text-sm"
            style={{
              background: 'white',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
          >
            🏠 回首頁
          </button>
        </div>
      </div>
    </div>
  )
}
