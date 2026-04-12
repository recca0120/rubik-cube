import { Canvas } from '@react-three/fiber'
import { Cube3D } from '@/components/Cube3D'

export function WizardCubeStage() {
  // No orbit control in Wizard: kids need a fixed "white up / green front / red right"
  // reference for R/U/F notation to remain meaningful.
  return (
    <main className="relative md:p-8 lg:p-12">
      <Canvas camera={{ position: [5.2, 4.2, 5.2], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 10, 7]} intensity={0.55} />
        <directionalLight position={[-5, -3, -5]} intensity={0.2} />
        <Cube3D />
      </Canvas>
    </main>
  )
}
