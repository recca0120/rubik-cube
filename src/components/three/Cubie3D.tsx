import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges, Text } from '@react-three/drei'
import { FACE_COLOR, faceletIndex, type FaceDir } from '@/cube/facelets'
import type { Pos } from './moveAnimation'
import { pulseIntensity } from './cubeAnimations'

const SIZE = 0.95
const GAP = 0.04
const INNER = '#111111'
const MAT_ORDER: FaceDir[] = ['R', 'L', 'U', 'D', 'F', 'B']
const BOUNCE_AMPLITUDE = 0.12
const BOUNCE_SPEED = 3 // radians/sec

export function Cubie3D({
  x, y, z, facelets, highlight,
}: Pos & { facelets: string; highlight?: boolean }) {
  const materials = MAT_ORDER.map((dir) => {
    const idx = faceletIndex(x, y, z, dir)
    const color = idx === null ? INNER : FACE_COLOR[facelets[idx]]
    return new THREE.MeshLambertMaterial({
      color,
      emissive: highlight ? '#ffd14f' : '#000000',
      emissiveIntensity: highlight ? 0.4 : 0,
    })
  })

  const base = SIZE + GAP
  const groupRef = useRef<THREE.Group>(null!)
  // slight phase offset per cubie so the bounce feels organic, not robotic
  const phase = (x + 2 * y + 3 * z) * 0.5

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const bounce = highlight ? Math.sin(clock.elapsedTime * BOUNCE_SPEED + phase) * BOUNCE_AMPLITUDE : 0
    groupRef.current.position.y = y * base + bounce
    if (highlight) {
      const v = pulseIntensity(clock.elapsedTime)
      // three.js materials must mutate per-frame for smooth pulse.
      // eslint-disable-next-line react-hooks/immutability
      for (const m of materials) m.emissiveIntensity = v
    }
  })

  return (
    <group ref={groupRef} position={[x * base, y * base, z * base]}>
      <mesh scale={highlight ? 1.08 : 1} material={materials}>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <Edges threshold={15} color="#1A1A2E" scale={1.001} />
      </mesh>
      {highlight && (
        <Text
          position={[0, SIZE * 0.95, 0]}
          fontSize={0.35}
          color="#ffd500"
          outlineColor="#1A1A2E"
          outlineWidth={0.02}
          anchorX="center"
          anchorY="middle"
        >
          ✨
        </Text>
      )}
    </group>
  )
}
