import { useEffect } from 'react'
import { useCubeStore } from '@/store/cubeStore'

const MOVE_KEYS = new Set(['u', 'd', 'l', 'r', 'f', 'b'])
const VIEW_STEP = Math.PI / 12 // 15°

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

/**
 * Global keyboard shortcuts.
 *   Moves:  u/d/l/r/f/b → CW ; Shift + letter → prime (CCW)
 *   View:   ←/→ rotate viewRotY ±15° ; ↑/↓ rotate viewRotX ±15° ; "0" reset
 * Ignored when an input/textarea has focus.
 *
 * Vim-style extensions (Vimium etc.) will conflict on single-letter keys.
 * Users should add the site to the extension's URL blacklist.
 */
export function CubeKeyboardControls({ disableView = false }: { disableView?: boolean } = {}) {
  const enqueue = useCubeStore((s) => s.enqueue)
  const setViewRotation = useCubeStore((s) => s.setViewRotation)
  const resetView = useCubeStore((s) => s.resetView)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isEditable(e.target) || isEditable(document.activeElement)) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const consume = () => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      if (!disableView) {
        if (e.key === '0') { resetView(); consume(); return }
        if (e.key === 'ArrowLeft') {
          const { viewRotX, viewRotY } = useCubeStore.getState()
          setViewRotation(viewRotX, viewRotY - VIEW_STEP); consume(); return
        }
        if (e.key === 'ArrowRight') {
          const { viewRotX, viewRotY } = useCubeStore.getState()
          setViewRotation(viewRotX, viewRotY + VIEW_STEP); consume(); return
        }
        if (e.key === 'ArrowUp') {
          const { viewRotX, viewRotY } = useCubeStore.getState()
          setViewRotation(viewRotX - VIEW_STEP, viewRotY); consume(); return
        }
        if (e.key === 'ArrowDown') {
          const { viewRotX, viewRotY } = useCubeStore.getState()
          setViewRotation(viewRotX + VIEW_STEP, viewRotY); consume(); return
        }
      }

      const letter = e.key.toLowerCase()
      if (!MOVE_KEYS.has(letter)) return
      const face = letter.toUpperCase()
      enqueue(e.shiftKey ? `${face}'` : face)
      consume()
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [enqueue, setViewRotation, resetView, disableView])
  return null
}
