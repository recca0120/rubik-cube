import { useState } from 'react'
import { SOLVED } from '@/cube/Cube'
import { FACE_COLOR, cycleFace } from '@/cube/facelets'
import { validateFacelets } from '@/cube/validate'
import { StickerButton } from './ui/StickerButton'

const FACES = ['U', 'R', 'F', 'D', 'L', 'B'] as const
type Face = (typeof FACES)[number]

// Layout of the unfolded cross: [row, col] in a 9×12 grid of cells.
// Each face takes a 3×3 block.
const FACE_POS: Record<Face, [number, number]> = {
  U: [0, 3],
  L: [3, 0],
  F: [3, 3],
  R: [3, 6],
  B: [3, 9],
  D: [6, 3],
}

const FACE_OFFSET: Record<Face, number> = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 }

export function ManualInput({
  initial,
  onApply,
  onCancel,
}: {
  initial?: string
  onApply: (facelets: string) => void
  onCancel?: () => void
}) {
  const [facelets, setFacelets] = useState(initial ?? SOLVED)
  const [picker, setPicker] = useState<Face>('U')
  const result = validateFacelets(facelets)

  const setCell = (absIdx: number, color: Face) => {
    const arr = [...facelets]
    arr[absIdx] = color
    setFacelets(arr.join(''))
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-base">Manual input</h3>

      <div className="text-xs font-body opacity-70">
        點格子用選定的顏色填色（中心格固定）。
      </div>

      <div className="flex gap-1.5 items-center text-xs">
        <span className="font-mono opacity-60 mr-1">顏色</span>
        {FACES.map((f) => (
          <button
            key={f}
            onClick={() => setPicker(f)}
            className="w-7 h-7 rounded-lg transition-transform"
            style={{
              background: FACE_COLOR[f],
              border: picker === f ? '3px solid var(--ink)' : '1.5px solid var(--ink)',
              transform: picker === f ? 'scale(1.1)' : undefined,
              boxShadow: picker === f ? 'var(--offset-sm)' : 'none',
            }}
            title={f}
          />
        ))}
      </div>

      <div
        className="grid gap-[2px] p-1.5 rounded-xl text-[0px] select-none"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(1.7rem, 1fr))',
          gridTemplateRows: 'repeat(9, 1.7rem)',
          background: 'var(--paper-deep)',
          border: '2px solid var(--ink)',
        }}
      >
        {FACES.map((face) => {
          const [r0, c0] = FACE_POS[face]
          return Array.from({ length: 9 }).map((_, i) => {
            const localR = Math.floor(i / 3)
            const localC = i % 3
            const row = r0 + localR
            const col = c0 + localC
            const absIdx = FACE_OFFSET[face] + i
            const isCenter = i === 4
            const letter = facelets[absIdx] as Face
            return (
              <button
                key={absIdx}
                onClick={() => !isCenter && setCell(absIdx, picker)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  if (!isCenter) setCell(absIdx, cycleFace(letter))
                }}
                disabled={isCenter}
                className="aspect-square rounded-sm transition-transform hover:scale-95 disabled:cursor-default"
                style={{
                  background: FACE_COLOR[letter],
                  border: '1px solid var(--ink)',
                  gridRow: row + 1,
                  gridColumn: col + 1,
                }}
                aria-label={`${face}${i} = ${letter}`}
              />
            )
          })
        })}
      </div>

      {!result.valid && (
        <ul className="text-xs font-body list-disc pl-5 space-y-0.5" style={{ color: 'var(--marker-red)' }}>
          {result.errors.slice(0, 4).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
          {result.errors.length > 4 && <li>…{result.errors.length - 4} more</li>}
        </ul>
      )}

      <div className="flex gap-2 flex-wrap">
        <StickerButton
          color="var(--marker-yellow)"
          disabled={!result.valid}
          onClick={() => onApply(facelets)}
          styleOverride={{ border: 'var(--border-thick)', boxShadow: result.valid ? 'var(--offset)' : 'none' }}
        >
          ✓ 套用
        </StickerButton>
        <StickerButton onClick={() => setFacelets(SOLVED)}>清空</StickerButton>
        {onCancel && <StickerButton onClick={onCancel}>取消</StickerButton>}
      </div>
    </div>
  )
}
