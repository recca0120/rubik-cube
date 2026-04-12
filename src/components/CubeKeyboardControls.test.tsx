import { describe, it, expect, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useCubeStore } from '@/store/cubeStore'
import { CubeKeyboardControls } from './CubeKeyboardControls'

function resetStore() {
  useCubeStore.getState().reset()
  useCubeStore.getState().resetView()
}

function press(key: string, opts: KeyboardEventInit = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }))
  })
}

describe('CubeKeyboardControls', () => {
  beforeEach(resetStore)

  it('lowercase u/d/l/r/f/b enqueue CW moves', () => {
    render(<CubeKeyboardControls />)
    press('u'); press('d'); press('l'); press('r'); press('f'); press('b')
    expect(useCubeStore.getState().queue).toEqual(['U', 'D', 'L', 'R', 'F', 'B'])
  })

  it('Shift + letter enqueues CCW (primed) move', () => {
    render(<CubeKeyboardControls />)
    press('U', { shiftKey: true })
    expect(useCubeStore.getState().queue).toEqual(["U'"])
  })

  it('ignores key when an input is focused', () => {
    render(
      <>
        <CubeKeyboardControls />
        <input data-testid="text-in" />
      </>,
    )
    const input = document.querySelector('input')!
    input.focus()
    press('u')
    expect(useCubeStore.getState().queue).toEqual([])
  })

  it('ignores unrelated keys', () => {
    render(<CubeKeyboardControls />)
    press('a'); press('q'); press(' ')
    expect(useCubeStore.getState().queue).toEqual([])
  })

  describe('view rotation (arrow keys)', () => {
    const STEP = Math.PI / 12 // 15°

    it('ArrowRight rotates viewRotY by +15°', () => {
      render(<CubeKeyboardControls />)
      press('ArrowRight')
      expect(useCubeStore.getState().viewRotY).toBeCloseTo(STEP)
    })

    it('ArrowLeft rotates viewRotY by -15°', () => {
      render(<CubeKeyboardControls />)
      press('ArrowLeft')
      expect(useCubeStore.getState().viewRotY).toBeCloseTo(-STEP)
    })

    it('ArrowUp rotates viewRotX by -15° (tilt up)', () => {
      render(<CubeKeyboardControls />)
      press('ArrowUp')
      expect(useCubeStore.getState().viewRotX).toBeCloseTo(-STEP)
    })

    it('ArrowDown rotates viewRotX by +15°', () => {
      render(<CubeKeyboardControls />)
      press('ArrowDown')
      expect(useCubeStore.getState().viewRotX).toBeCloseTo(STEP)
    })

    it('"0" key resets both axes to 0', () => {
      useCubeStore.setState({ viewRotX: 1.2, viewRotY: -0.7 })
      render(<CubeKeyboardControls />)
      press('0')
      expect(useCubeStore.getState().viewRotX).toBe(0)
      expect(useCubeStore.getState().viewRotY).toBe(0)
    })
  })
})
