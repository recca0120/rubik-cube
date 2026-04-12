/** Floating emoji decoration. */
export function Decoration({
  emoji, top, left, right, bottom, delay, size = 28,
}: {
  emoji: string
  top?: string; left?: string; right?: string; bottom?: string
  delay: string
  size?: number
}) {
  return (
    <span
      className="absolute anim-float select-none pointer-events-none opacity-50"
      style={{ top, left, right, bottom, fontSize: size, animationDelay: delay }}
      aria-hidden
    >
      {emoji}
    </span>
  )
}
