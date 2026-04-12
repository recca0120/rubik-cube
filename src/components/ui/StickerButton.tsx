/**
 * Pop-up Paper Toybook sticker button — the universal CTA primitive.
 * Replaces ad-hoc V2Btn / PlayerBtn / TabButton helpers across the codebase.
 *
 * Variants:
 *   primary  — thicker border + bigger offset shadow (hero CTA)
 *   default  — mid border + small offset (secondary)
 *   chip     — pill / rounded-full, smaller (tags + toggles)
 */

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type StickerVariant = 'primary' | 'default' | 'chip'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
  /** Background color token (e.g. 'var(--marker-yellow)'). Default white. */
  color?: string
  /** Text color override. Default 'var(--ink)'. */
  textColor?: string
  variant?: StickerVariant
  /** Tilt rotation in deg, e.g. -1.5. */
  tilt?: number
  children: ReactNode
  /** Optional extra style overrides (merged last). */
  styleOverride?: CSSProperties
}

export function StickerButton({
  color = 'white',
  textColor = 'var(--ink)',
  variant = 'default',
  tilt,
  className = '',
  disabled,
  styleOverride,
  children,
  ...rest
}: Props) {
  const sizing =
    variant === 'chip'
      ? 'text-xs px-3 py-1.5 rounded-full'
      : variant === 'primary'
        ? 'text-base px-4 py-2 rounded-xl'
        : 'text-sm px-3 py-1.5 rounded-xl'
  const border = variant === 'primary' ? 'var(--border-thick)' : variant === 'chip' ? '1.5px solid var(--ink)' : 'var(--border-mid)'
  const shadow = disabled ? 'none' : variant === 'primary' ? 'var(--offset)' : 'var(--offset-sm)'

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`font-display active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed ${sizing} ${className}`}
      style={{
        background: color,
        color: textColor,
        border,
        boxShadow: shadow,
        transform: tilt !== undefined ? `rotate(${tilt}deg)` : undefined,
        ...styleOverride,
      }}
    >
      {children}
    </button>
  )
}
