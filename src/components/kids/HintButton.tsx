import { useEffect, useState } from 'react'

type Props = {
  onShow: () => void
  cooldownMs?: number
  label?: string
}

export function HintButton({ onShow, cooldownMs = 5000, label = '💡 提示' }: Props) {
  const [coolingUntil, setCoolingUntil] = useState<number | null>(null)

  useEffect(() => {
    if (coolingUntil === null) return
    const remaining = coolingUntil - Date.now()
    if (remaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoolingUntil(null)
      return
    }
    const id = setTimeout(() => setCoolingUntil(null), remaining)
    return () => clearTimeout(id)
  }, [coolingUntil])

  const disabled = coolingUntil !== null

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return
        onShow()
        setCoolingUntil(Date.now() + cooldownMs)
      }}
      disabled={disabled}
      className="text-xs px-3 py-1.5 rounded-xl font-display disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'white',
        color: 'var(--ink)',
        border: 'var(--border-mid)',
        boxShadow: disabled ? 'none' : 'var(--offset-sm)',
      }}
    >
      {label}
    </button>
  )
}
