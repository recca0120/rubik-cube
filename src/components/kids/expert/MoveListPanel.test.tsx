import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useCubeStore } from '@/store/cubeStore'
import { MoveListPanel } from './MoveListPanel'

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({
    lastSolution: null,
    lastLBLSolution: null,
    segmentBoundaries: [],
    totalProgram: 0,
    queue: [],
  })
})

describe('MoveListPanel (RD2-X9)', () => {
  it('renders nothing when no solution + no queue', () => {
    const { container } = render(<MoveListPanel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows LBL segment breakdown when lastLBLSolution is set', () => {
    useCubeStore.setState({
      lastLBLSolution: {
        cross: ['R', 'U'],
        whiteCorners: ['F'],
        middleLayer: [],
        yellowCross: ['D2'],
        yellowFace: [],
        pll: ['R', "U'"],
      },
      segmentBoundaries: [2, 3, 3, 4, 4, 6],
      totalProgram: 6,
      queue: ['R', 'U', 'F', 'D2', 'R', "U'"],
    })
    render(<MoveListPanel />)
    const panel = screen.getByTestId('move-list')
    expect(panel).toHaveTextContent(/白十字/)
    expect(panel).toHaveTextContent(/白角/)
    expect(panel).toHaveTextContent(/PLL/)
  })

  it('shows plain solution when only lastSolution (Kociemba)', () => {
    useCubeStore.setState({
      lastSolution: "R U R' U' F",
      totalProgram: 5,
      queue: ['R', 'U', "R'", "U'", 'F'],
    })
    render(<MoveListPanel />)
    expect(screen.getByTestId('move-list')).toHaveTextContent(/R U R' U' F/)
  })
})
