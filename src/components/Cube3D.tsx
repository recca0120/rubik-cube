import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useCubeStore } from '@/store/cubeStore'
import { parseMove, type Pos } from './three/moveAnimation'
import { idleRotationSpeed } from './three/cubeAnimations'
import { pieceKind } from './three/pieceKind'
import { Cubie3D } from './three/Cubie3D'
import { FaceLabels } from './three/FaceLabels'
import { GhostArrow } from './three/GhostArrow'
import { MoveLabel } from './three/MoveLabel'

const BASE_TURN_DURATION = 0.25 // seconds per 90° at speed=1

export function Cube3D() {
  const cube = useCubeStore((s) => s.cube)
  const queue = useCubeStore((s) => s.queue)
  const finishMove = useCubeStore((s) => s.finishMove)
  const highlightedFace = useCubeStore((s) => s.highlightedFace)
  const highlightedMove = useCubeStore((s) => s.highlightedMove)
  const showNotation = useCubeStore((s) => s.showNotation)
  const appMode = useCubeStore((s) => s.appMode)
  const speed = useCubeStore((s) => s.speed)
  const viewFlipped = useCubeStore((s) => s.viewFlipped)
  const highlightedPieces = useCubeStore((s) => s.highlightedPieces)
  const highlightedCubies = useCubeStore((s) => s.highlightedCubies)
  const viewRotX = useCubeStore((s) => s.viewRotX)
  const viewRotY = useCubeStore((s) => s.viewRotY)
  const paused = useCubeStore((s) => s.paused)
  const stepTokens = useCubeStore((s) => s.stepTokens)

  const facelets = cube.facelets
  const activeMove = queue[0]
  const move = useMemo(() => parseMove(activeMove), [activeMove])

  const groupRef = useRef<THREE.Group>(null!)
  const rootRef = useRef<THREE.Group>(null!)
  const progress = useRef(0)

  useEffect(() => {
    progress.current = 0
    if (groupRef.current) groupRef.current.rotation.set(0, 0, 0)
  }, [activeMove])

  const cubies = useMemo(() => {
    const out: Pos[] = []
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue
          out.push({ x, y, z })
        }
    return out
  }, [])

  useFrame((_, delta) => {
    if (rootRef.current) {
      const w = idleRotationSpeed({
        queueLength: queue.length,
        highlightedFace,
        mode: appMode === 'wizard' ? 'wizard' : 'sandbox',
      })
      if (w > 0) rootRef.current.rotation.y += w * delta
    }

    if (!move || !groupRef.current) return
    // Respect paused state unless a stepToken is granted (step-by-step mode).
    if (paused && stepTokens <= 0) return
    const dur = BASE_TURN_DURATION / Math.max(0.1, speed)
    progress.current = Math.min(1, progress.current + delta / dur)
    const angle = move.sign * (Math.PI / 2) * move.quarterTurns * progress.current
    groupRef.current.rotation.set(0, 0, 0)
    groupRef.current.rotation[move.axis] = angle

    if (progress.current >= 1) {
      progress.current = 0
      finishMove()
    }
  })

  const rotating = move ? cubies.filter(move.layer) : []
  const stationary = move ? cubies.filter((c) => !move.layer(c)) : cubies
  const isOnHighlightedFace = (c: Pos): boolean => {
    if (!highlightedFace) return false
    switch (highlightedFace) {
      case 'R': return c.x === 1
      case 'L': return c.x === -1
      case 'U': return c.y === 1
      case 'D': return c.y === -1
      case 'F': return c.z === 1
      case 'B': return c.z === -1
      default: return false
    }
  }
  const isHighlightedPiece = (c: Pos): boolean => {
    if (!highlightedPieces) return false
    const kind = pieceKind(c.x, c.y, c.z)
    if (highlightedPieces === 'centers') return kind === 'center'
    if (highlightedPieces === 'edges') return kind === 'edge'
    return kind === 'corner'
  }
  const isInHighlightedCubies = (c: Pos): boolean =>
    !!highlightedCubies?.some(([x, y, z]) => x === c.x && y === c.y && z === c.z)
  const isPreview = (c: Pos) => isOnHighlightedFace(c) || isHighlightedPiece(c) || isInHighlightedCubies(c)

  return (
    <group rotation={[viewRotX, viewRotY, 0]}>
    <group ref={rootRef} rotation={viewFlipped ? [Math.PI, 0, 0] : [0, 0, 0]} data-testid="cube3d-root">
      <group ref={groupRef}>
        {rotating.map((c) => (
          <Cubie3D key={`r-${c.x},${c.y},${c.z}`} {...c} facelets={facelets} highlight={isPreview(c)} />
        ))}
      </group>
      {stationary.map((c) => (
        <Cubie3D key={`s-${c.x},${c.y},${c.z}`} {...c} facelets={facelets} highlight={isPreview(c)} />
      ))}
      {showNotation && <FaceLabels />}
      {highlightedMove && <GhostArrow move={highlightedMove} />}
      {highlightedMove && <MoveLabel move={highlightedMove} />}
    </group>
    </group>
  )
}
