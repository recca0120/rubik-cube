import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { Cube3D } from '@/components/Cube3D'
import { useCubeStore } from '@/store/cubeStore'
import { MoveKeypad } from './MoveKeypad'
import { Confetti } from './Confetti'
import { CubeKeyboardControls } from '@/components/CubeKeyboardControls'

type Props = { onExit: () => void }

export function Sandbox({ onExit }: Props) {
  const enqueue = useCubeStore((s) => s.enqueue)
  const scramble = useCubeStore((s) => s.scramble)
  const reset = useCubeStore((s) => s.reset)
  const cube = useCubeStore((s) => s.cube)

  // RD3-10: confetti when cube transitions from un-solved to solved.
  const [celebrating, setCelebrating] = useState(false)
  const wasSolvedRef = useRef(cube.isSolved())
  useEffect(() => {
    const solved = cube.isSolved()
    // Transition detection (un-solved → solved) needs ref + effect by design.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!wasSolvedRef.current && solved) setCelebrating(true)
    wasSolvedRef.current = solved
  }, [cube])

  return (
    <div
      className="h-screen grid grid-rows-[auto_55vh_minmax(0,1fr)] overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      <CubeKeyboardControls />
      <Confetti show={celebrating} count={80} duration={2000} onDone={() => setCelebrating(false)} />
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'white', borderBottom: 'var(--border-mid)' }}
      >
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl font-display text-sm"
          style={{
            background: 'var(--marker-pink)',
            color: 'var(--ink)',
            border: 'var(--border-mid)',
            boxShadow: 'var(--offset-sm)',
          }}
        >
          🏠 回首頁
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => scramble()}
            className="px-3 py-1.5 rounded-xl font-display text-sm"
            style={{
              background: 'var(--marker-yellow)',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
          >
            🎲 打亂
          </button>
          <button
            onClick={() => reset()}
            className="px-3 py-1.5 rounded-xl font-display text-sm"
            style={{
              background: 'white',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
            title="重設"
          >
            ↻ 重設
          </button>
        </div>
      </header>

      <main className="relative">
        <Canvas camera={{ position: [5, 4.5, 5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[5, 10, 7]} intensity={0.55} />
          <directionalLight position={[-5, -3, -5]} intensity={0.2} />
          <Cube3D />
          <TrackballControls noPan minDistance={4} maxDistance={15} rotateSpeed={3} zoomSpeed={1.2} staticMoving />
        </Canvas>
      </main>

      <footer
        className="p-3 overflow-y-auto"
        style={{ background: 'white', borderTop: 'var(--border-mid)' }}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          <MoveKeypad onMove={(m) => enqueue(m)} />
          <div className="flex justify-end">
            <button
              onClick={onExit}
              className="text-xs font-display px-3 py-1.5 rounded-full"
              style={{
                background: 'var(--paper-deep)',
                color: 'var(--ink)',
                border: '1.5px solid var(--ink)',
              }}
            >
              💭 想學解法？
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
