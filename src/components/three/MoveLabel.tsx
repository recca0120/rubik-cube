import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

/**
 * Big letter label that pops above the cube during demo moves — so kids
 * can see which move (U / R / F' / etc.) is being performed.
 */
export function MoveLabel({ move }: { move: string }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // bob up-and-down so the letter reads as "alive"
    groupRef.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 2.4) * 0.15
  })
  return (
    <group ref={groupRef} position={[0, 2.6, 0]}>
      <Text
        fontSize={0.9}
        color="#ffd500"
        outlineColor="#1A1A2E"
        outlineWidth={0.06}
        anchorX="center"
        anchorY="middle"
      >
        {move}
      </Text>
    </group>
  )
}
