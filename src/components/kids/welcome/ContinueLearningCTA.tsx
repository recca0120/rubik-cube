import type { WizardChapter } from '../wizardChapters'

export function ContinueLearningCTA({
  chapter, onGo,
}: { chapter: WizardChapter; onGo: () => void }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 max-w-sm mx-auto">
      <button
        onClick={onGo}
        data-recommended="true"
        className="anim-fadeup hover-wiggle text-left rounded-3xl px-4 py-4 flex items-center gap-3 relative active:scale-95 transition-transform"
        style={{
          background: 'var(--marker-yellow)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--offset)',
          transform: 'rotate(-1.5deg)',
          animationDelay: '0.6s',
        }}
      >
        <span className="text-4xl select-none">📚</span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-xl md:text-2xl" style={{ color: 'var(--ink)' }}>
            繼續學習
          </span>
          <span className="block font-body text-xs md:text-sm mt-0.5 truncate" style={{ color: 'var(--ink)', opacity: 0.85 }}>
            Ch{chapter.id} · {chapter.title}
          </span>
        </span>
        <span
          className="absolute -top-3 -right-2 font-display text-xs px-2 py-1 rounded-full"
          style={{ background: 'var(--ink)', color: 'var(--marker-yellow)', transform: 'rotate(8deg)' }}
        >
          推薦 ★
        </span>
      </button>
    </div>
  )
}
