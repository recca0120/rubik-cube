import { CaseMiniPreview } from '../CaseMiniPreview'

export type CaseData = {
  id: string
  name: string
  description?: string
  alg: string
}

export function CaseCard({
  c, family, onApply,
}: { c: CaseData; family: 'f2l' | 'pll'; onApply: (c: CaseData) => void }) {
  return (
    <button
      data-testid={`case-card-${c.id}`}
      onClick={() => onApply(c)}
      className="text-left rounded-2xl p-3 active:scale-95 transition-transform"
      style={{
        background: 'white',
        border: 'var(--border-mid)',
        boxShadow: 'var(--offset-sm)',
      }}
    >
      <div className="flex gap-2 mb-1">
        <div className="flex-shrink-0">
          <CaseMiniPreview alg={c.alg} family={family} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm truncate" style={{ color: 'var(--ink)' }}>
            {c.name}
          </div>
          {c.description && (
            <div className="text-xs font-body opacity-70 line-clamp-2">
              {c.description}
            </div>
          )}
        </div>
      </div>
      <div
        className="font-mono text-xs p-1.5 rounded-lg break-all"
        style={{ background: 'var(--paper)', color: 'var(--ink)' }}
      >
        {c.alg}
      </div>
    </button>
  )
}
