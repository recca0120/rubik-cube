import type { CSSProperties, ReactNode } from 'react'

/** White paper-card panel with ink border + offset shadow. */
export function Panel({
  title,
  children,
  className = '',
  styleOverride,
}: {
  title?: string
  children: ReactNode
  className?: string
  styleOverride?: CSSProperties
}) {
  return (
    <div
      className={`rounded-2xl p-3 md:p-4 ${className}`}
      style={{
        background: 'white',
        border: 'var(--border-mid)',
        boxShadow: 'var(--offset-sm)',
        ...styleOverride,
      }}
    >
      {title && <h3 className="font-display text-sm md:text-base mb-2 md:mb-3">{title}</h3>}
      {children}
    </div>
  )
}
