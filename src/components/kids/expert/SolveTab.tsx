import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { Cube3D } from '@/components/Cube3D'
import { useCubeStore } from '@/store/cubeStore'
import { StateInputDrawer } from './StateInputDrawer'
import { SolveToolbar } from './solve/SolveToolbar'
import { SolverStatusBanners } from './solve/SolverStatusBanners'
import { SolveResultArea } from './solve/SolveResultArea'

export function SolveTab() {
  const [inputOpen, setInputOpen] = useState(false)
  const solving = useCubeStore((s) => s.solving)

  return (
    <div className="flex flex-col min-h-full">
      <SolveToolbar onOpenInput={() => setInputOpen(true)} />
      <SolverStatusBanners />

      <section
        data-testid="solve-cube-canvas"
        className="relative h-[45vh] lg:h-[55vh]"
        style={{ background: 'var(--paper-deep)', borderBottom: 'var(--border-mid)' }}
      >
        <Canvas camera={{ position: [4, 3.5, 4], fov: 42 }} dpr={[1, 2]}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[5, 10, 7]} intensity={0.55} />
          <directionalLight position={[-5, -3, -5]} intensity={0.2} />
          <Cube3D />
          <TrackballControls noPan minDistance={4} maxDistance={15} rotateSpeed={3} zoomSpeed={1.2} staticMoving />
        </Canvas>
        {solving && (
          <div
            data-testid="solving-overlay"
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(2px)' }}
          >
            <div
              className="rounded-2xl px-5 py-3 font-display anim-pop"
              style={{
                background: 'white',
                color: 'var(--ink)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--offset)',
              }}
            >
              🧠 計算解法中...
            </div>
          </div>
        )}
      </section>

      <StateInputDrawer open={inputOpen} onClose={() => setInputOpen(false)} />
      <SolveResultArea />
    </div>
  )
}
