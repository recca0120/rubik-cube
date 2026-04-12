import { parseMoveDirection } from './cubeAnimations'

const ARROW_DISTANCE = 1.55
const ARROW_RADIUS = 0.75

/** RD2-C6: 3/4-circle arrow hovering in front of the highlighted face,
 *  sweeping in the direction the next move will rotate. */
export function GhostArrow({ move }: { move: string }) {
  const parsed = parseMoveDirection(move)
  if (!parsed) return null
  const { face, direction } = parsed

  const axisMap: Record<string, { pos: [number, number, number]; normal: [number, number, number] }> = {
    U: { pos: [0,  ARROW_DISTANCE, 0], normal: [-Math.PI / 2, 0, 0] },
    D: { pos: [0, -ARROW_DISTANCE, 0], normal: [ Math.PI / 2, 0, 0] },
    R: { pos: [ ARROW_DISTANCE, 0, 0], normal: [0,  Math.PI / 2, 0] },
    L: { pos: [-ARROW_DISTANCE, 0, 0], normal: [0, -Math.PI / 2, 0] },
    F: { pos: [0, 0,  ARROW_DISTANCE], normal: [0, 0, 0] },
    B: { pos: [0, 0, -ARROW_DISTANCE], normal: [0, Math.PI, 0] },
  }
  const cfg = axisMap[face]
  if (!cfg) return null

  const is180 = direction === '180'
  const arcAngle = is180 ? Math.PI * 1.5 : Math.PI * 1.25
  const midAngle = Math.PI / 2
  const thetaStart = midAngle - arcAngle / 2
  const thetaEnd = midAngle + arcAngle / 2
  const headAngle = direction === 'ccw' ? thetaEnd : thetaStart
  const headRotation = headAngle + Math.PI / 2 + (direction === 'ccw' ? 0 : Math.PI)

  return (
    <group position={cfg.pos} rotation={cfg.normal}>
      <mesh rotation={[0, 0, thetaStart]}>
        <torusGeometry args={[ARROW_RADIUS, 0.11, 8, 32, arcAngle]} />
        <meshLambertMaterial color="#1A1A2E" emissive="#ffd14f" emissiveIntensity={0.5} />
      </mesh>
      <mesh
        position={[
          ARROW_RADIUS * Math.cos(headAngle),
          ARROW_RADIUS * Math.sin(headAngle),
          0,
        ]}
        rotation={[0, 0, headRotation]}
      >
        <coneGeometry args={[0.18, 0.35, 12]} />
        <meshLambertMaterial color="#1A1A2E" emissive="#ffd14f" emissiveIntensity={0.5} />
      </mesh>
      {is180 && (
        <mesh
          position={[
            ARROW_RADIUS * Math.cos(thetaEnd),
            ARROW_RADIUS * Math.sin(thetaEnd),
            0,
          ]}
          rotation={[0, 0, thetaEnd + Math.PI / 2]}
        >
          <coneGeometry args={[0.18, 0.35, 12]} />
          <meshLambertMaterial color="#1A1A2E" emissive="#ffd14f" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}
