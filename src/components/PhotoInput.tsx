import { useState } from 'react'
import { FACE_COLOR } from '@/cube/facelets'
import { assembleFacelets } from '@/vision/assemble'
import { scanImageFile } from '@/vision/scanImage'
import { validateFacelets } from '@/cube/validate'
import type { FaceLetter } from '@/vision/colors'
import { StickerButton } from './ui/StickerButton'

const FACES: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B']
const FACE_NAMES: Record<FaceLetter, string> = {
  U: 'Up (white)',
  R: 'Right (red)',
  F: 'Front (green)',
  D: 'Down (yellow)',
  L: 'Left (orange)',
  B: 'Back (blue)',
}

import { cycleFace } from '@/cube/facelets'

export function PhotoInput({
  onApply,
  onCancel,
}: {
  onApply: (facelets: string) => void
  onCancel?: () => void
}) {
  // For each face we keep: the detected 9-char string (with the center forced to the face letter).
  const [faces, setFaces] = useState<Partial<Record<FaceLetter, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [scanningFace, setScanningFace] = useState<FaceLetter | null>(null)

  const handleUpload = async (face: FaceLetter, file: File) => {
    setScanningFace(face)
    setError(null)
    try {
      const raw = await scanImageFile(file)
      // Force center to the face letter (user told us which face this is)
      const fixed = raw.slice(0, 4) + face + raw.slice(5)
      setFaces((prev) => ({ ...prev, [face]: fixed }))
    } catch (e) {
      setError(`Failed to scan ${face}: ${(e as Error).message}`)
    } finally {
      setScanningFace(null)
    }
  }

  const toggleCell = (face: FaceLetter, idx: number) => {
    if (idx === 4) return // center is fixed
    const current = faces[face]
    if (!current) return
    const arr = [...current]
    arr[idx] = cycleFace(arr[idx]) as FaceLetter
    setFaces((prev) => ({ ...prev, [face]: arr.join('') }))
  }

  const complete = FACES.every((f) => faces[f])
  const result = complete ? validateFacelets(assembleFacelets(faces as Record<FaceLetter, string>)) : null

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Input from photos</h3>
      <p className="text-xs text-neutral-400">
        Upload one photo per face (center well-aligned to the image). Click detected cells to correct errors.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {FACES.map((face) => {
          const detected = faces[face]
          return (
            <div key={face} className="bg-neutral-950 border border-neutral-800 rounded p-2 space-y-1">
              <div className="text-xs font-medium flex items-center justify-between">
                <span>
                  {face} — <span className="text-neutral-400">{FACE_NAMES[face]}</span>
                </span>
                {scanningFace === face && <span className="text-neutral-400">scanning…</span>}
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs w-full file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-700 hover:file:bg-neutral-600 file:text-white"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(face, f)
                  }}
                />
              </label>
              {detected && (
                <div className="grid grid-cols-3 gap-[2px]">
                  {[...detected].map((c, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCell(face, i)}
                      disabled={i === 4}
                      className="aspect-square rounded-sm border border-neutral-800 disabled:cursor-default"
                      style={{ background: FACE_COLOR[c] }}
                      aria-label={`${face}${i} = ${c}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <div className="text-xs font-body" style={{ color: 'var(--marker-red)' }}>{error}</div>}

      {result && !result.valid && (
        <ul className="text-xs font-body list-disc pl-5 space-y-0.5" style={{ color: 'var(--marker-red)' }}>
          {result.errors.slice(0, 3).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
          {result.errors.length > 3 && <li>…{result.errors.length - 3} more</li>}
        </ul>
      )}

      <div className="flex gap-2 flex-wrap">
        <StickerButton
          color="var(--marker-yellow)"
          disabled={!result?.valid}
          onClick={() => result?.valid && onApply(assembleFacelets(faces as Record<FaceLetter, string>))}
          styleOverride={{ border: 'var(--border-thick)', boxShadow: result?.valid ? 'var(--offset)' : 'none' }}
        >
          ✓ 套用
        </StickerButton>
        <StickerButton onClick={() => { setFaces({}); setError(null) }}>清空</StickerButton>
        {onCancel && <StickerButton onClick={onCancel}>取消</StickerButton>}
      </div>
    </div>
  )
}
