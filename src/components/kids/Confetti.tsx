import { useEffect, useMemo } from 'react'

const COLORS = [
  '#E63946', // marker red
  '#FFD23F', // marker yellow
  '#2A9D8F', // marker blue
  '#F08FC0', // marker pink
  '#95C623', // marker grass
  '#6A4C93', // marker purple
]

type Props = {
  show: boolean
  count?: number
  duration?: number
  onDone?: () => void
}

type Particle = {
  left: number
  delay: number
  rotation: number
  color: string
  size: number
  duration: number
}

export function Confetti({ show, count = 50, duration = 2000, onDone }: Props) {
  /* eslint-disable react-hooks/purity -- visual-only randomness per show-trigger */
  const particles: Particle[] = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 300,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        duration: 1500 + Math.random() * 1000,
      })),
    [count, show],
  )
  /* eslint-enable react-hooks/purity */

  useEffect(() => {
    if (!show || !onDone) return
    const id = setTimeout(onDone, duration)
    return () => clearTimeout(id)
  }, [show, duration, onDone])

  if (!show) return null

  return (
    <div
      data-testid="confetti"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20vh) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0.4; }
        }
      `}</style>
      {particles.map((p, i) => (
        <span
          key={i}
          className="confetti-particle absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: i % 4 === 0 ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}ms ${p.delay}ms ease-in forwards`,
            borderRadius: i % 5 === 0 ? '50%' : i % 3 === 0 ? '0' : '2px',
            border: '1.5px solid #1A1A2E',
          }}
        />
      ))}
    </div>
  )
}
