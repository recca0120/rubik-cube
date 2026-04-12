import { useMemo, useState } from 'react'
import { Cube } from '@/cube/Cube'
import { StickerButton } from './ui/StickerButton'

type Parsed =
  | { ok: true; moves: string[]; facelets: string }
  | { ok: false; error: string }

function parse(alg: string): Parsed {
  const trimmed = alg.trim()
  if (!trimmed) return { ok: false, error: 'empty' }
  try {
    const cube = new Cube().applyAlg(trimmed)
    const moves = trimmed.split(/\s+/).filter(Boolean)
    return { ok: true, moves, facelets: cube.facelets }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function FormulaInput({
  onApply,
  onCancel,
}: {
  onApply: (facelets: string) => void
  onCancel?: () => void
}) {
  const [text, setText] = useState('')
  const parsed = useMemo(() => parse(text), [text])
  const canApply = parsed.ok

  return (
    <div className="space-y-3">
      <h3 className="font-display text-base">Input from formula</h3>
      <p className="text-xs font-body opacity-70">
        從打亂公式套用，例如 <code className="font-mono">R U R' U' F2</code>。支援 U/D/L/R/F/B + <code className="font-mono">'</code> 或 <code className="font-mono">2</code>。
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="R U R' U' F2 L D2 B"
        rows={3}
        className="w-full font-mono text-sm rounded-xl p-2 resize-none focus:outline-none"
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--ink)',
          color: 'var(--ink)',
        }}
      />

      {text.trim() !== '' && (
        <div className="text-xs font-mono">
          {parsed.ok ? (
            <span style={{ color: 'var(--marker-grass)' }}>✓ {parsed.moves.length} moves</span>
          ) : (
            <span style={{ color: 'var(--marker-red)' }}>✗ {parsed.error}</span>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <StickerButton
          color="var(--marker-yellow)"
          disabled={!canApply}
          onClick={() => parsed.ok && onApply(parsed.facelets)}
          styleOverride={{ border: 'var(--border-thick)', boxShadow: canApply ? 'var(--offset)' : 'none' }}
        >
          ✓ 套用
        </StickerButton>
        <StickerButton onClick={() => setText('')}>清空</StickerButton>
        {onCancel && <StickerButton onClick={onCancel}>取消</StickerButton>}
      </div>
    </div>
  )
}
