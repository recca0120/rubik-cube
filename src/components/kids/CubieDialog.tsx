import { useEffect, useState } from 'react'
import { Cubie, type CubieEmotion, type CubieGesture } from './Cubie'

type DialogProps = {
  message: string
  /** Optional hint shown as italic second line beneath the main message. */
  hint?: string
  emotion?: CubieEmotion
  onNext?: () => void
  nextLabel?: string
  /** typewriter speed (ms per char), 0 to disable */
  typewriterMs?: number
  gesture?: CubieGesture
}

export function CubieDialog({
  message,
  hint,
  emotion = 'calm',
  onNext,
  nextLabel = '下一步 →',
  typewriterMs = 30,
  gesture = 'idle',
}: DialogProps) {
  const [shown, setShown] = useState(typewriterMs > 0 ? '' : message)
  const [done, setDone] = useState(typewriterMs === 0)

  useEffect(() => {
    if (typewriterMs === 0) {
      setShown(message)
      setDone(true)
      return
    }
    setShown('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(message.slice(0, i))
      if (i >= message.length) {
        clearInterval(id)
        setDone(true)
      }
    }, typewriterMs)
    return () => clearInterval(id)
  }, [message, typewriterMs])

  return (
    <div className="flex items-end gap-2 anim-pop">
      <Cubie emotion={emotion} size={96} className="flex-shrink-0" talking={!done} gesture={gesture} />
      <div
        className="flex-1 bg-white rounded-3xl rounded-bl-md px-4 py-3 relative cursor-pointer"
        style={{
          border: 'var(--border-thick)',
          boxShadow: 'var(--offset)',
        }}
        onClick={() => !done && setShown(message)}
      >
        <span
          className="font-display text-sm absolute -top-3 left-4 px-3 py-0.5 rounded-full"
          style={{
            background: 'var(--marker-yellow)',
            color: 'var(--ink)',
            border: 'var(--border-mid)',
          }}
        >
          Cubie
        </span>
        <div className="font-body text-base leading-relaxed pt-1">
          {shown}
          {!done && <span className="inline-block w-1.5 h-5 bg-slate-700 animate-pulse ml-0.5 align-middle" />}
        </div>
        {hint && done && (
          <div className="font-body text-sm italic mt-1 opacity-80">💡 {hint}</div>
        )}
        {onNext && done && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="mt-3 font-display text-base px-5 py-2 rounded-2xl text-white hover-wiggle"
            style={{
              background: 'var(--marker-blue)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
