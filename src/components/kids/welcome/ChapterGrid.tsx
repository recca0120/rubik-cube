import { CHAPTERS } from '../wizardChapters'

export function ChapterGrid({
  earnedStars, onGoto,
}: { earnedStars: Record<number, number>; onGoto: (id: number) => void }) {
  return (
    <div
      data-testid="chapter-grid"
      className="mt-8 max-w-md mx-auto grid grid-cols-3 gap-2 anim-fadeup"
      style={{ animationDelay: '1s' }}
    >
      {CHAPTERS.map((c) => {
        const stars = earnedStars[c.id] ?? 0
        const parentDone = c.parent === null || (earnedStars[c.parent] ?? 0) > 0
        const locked = !parentDone
        const cleared = stars > 0
        return (
          <button
            key={c.id}
            onClick={() => onGoto(c.id)}
            disabled={locked}
            className="rounded-xl px-2 py-2.5 text-left active:scale-95 transition-transform disabled:cursor-not-allowed"
            style={{
              background: locked
                ? 'var(--paper-deep)'
                : cleared
                  ? 'var(--marker-grass)'
                  : 'white',
              border: 'var(--border-mid)',
              boxShadow: locked ? 'none' : 'var(--offset-sm)',
              opacity: locked ? 0.55 : 1,
            }}
          >
            <div className="font-display text-sm flex items-center justify-between">
              <span>Ch{c.id}</span>
              <span>{locked ? '🔒' : cleared ? '⭐' : '▶'}</span>
            </div>
            <div
              className="font-body text-[10px] leading-tight mt-0.5 truncate"
              style={{ color: 'var(--ink)', opacity: 0.8 }}
            >
              {c.title}
            </div>
            {!locked && (
              <div className="font-mono text-[10px] mt-0.5">
                {[1, 2, 3].map((i) => (
                  <span key={i} style={{ color: i <= stars ? 'var(--ink)' : 'var(--paper-deep)' }}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
