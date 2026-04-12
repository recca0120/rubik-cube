import { Text } from '@react-three/drei'

const FACE_OFFSET = 1.7

/** RD2-C3: big letter overlays at each face centre. */
export function FaceLabels() {
  const labels: Array<{ letter: string; pos: [number, number, number]; rot: [number, number, number] }> = [
    { letter: 'U', pos: [0, FACE_OFFSET, 0],  rot: [-Math.PI / 2, 0, 0] },
    { letter: 'D', pos: [0, -FACE_OFFSET, 0], rot: [Math.PI / 2, 0, 0] },
    { letter: 'R', pos: [FACE_OFFSET, 0, 0],  rot: [0, Math.PI / 2, 0] },
    { letter: 'L', pos: [-FACE_OFFSET, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { letter: 'F', pos: [0, 0, FACE_OFFSET],  rot: [0, 0, 0] },
    { letter: 'B', pos: [0, 0, -FACE_OFFSET], rot: [0, Math.PI, 0] },
  ]
  return (
    <>
      {labels.map((l) => (
        <Text
          key={l.letter}
          position={l.pos}
          rotation={l.rot}
          fontSize={0.6}
          color="#1A1A2E"
          anchorX="center"
          anchorY="middle"
          outlineColor="#FBF4DD"
          outlineWidth={0.04}
        >
          {l.letter}
        </Text>
      ))}
    </>
  )
}
