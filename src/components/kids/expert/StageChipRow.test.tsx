import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useCubeStore } from '@/store/cubeStore'
import { StageChipRow } from './StageChipRow'

beforeEach(() => {
  useCubeStore.getState().reset()
})

describe('StageChipRow (RD2-X5)', () => {
  it('renders nothing when no lastLBLSolution', () => {
    const { container } = render(<StageChipRow />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders 6 stage chips when LBL solution is present', () => {
    useCubeStore.setState({
      lastLBLSolution: {
        cross: ['R'], whiteCorners: ['U'], middleLayer: ['F'],
        yellowCross: ['D'], yellowFace: ['L'], pll: ['B'],
      },
      segmentBoundaries: [1, 2, 3, 4, 5, 6],
      totalProgram: 6,
      queue: ['R', 'U', 'F', 'D', 'L', 'B'],
    })
    render(<StageChipRow />)
    expect(screen.getAllByTestId(/^stage-chip-/)).toHaveLength(6)
  })

  it('marks correct stage as current', () => {
    useCubeStore.setState({
      lastLBLSolution: {
        cross: ['R'], whiteCorners: ['U'], middleLayer: ['F'],
        yellowCross: ['D'], yellowFace: ['L'], pll: ['B'],
      },
      segmentBoundaries: [1, 2, 3, 4, 5, 6],
      totalProgram: 6,
      queue: ['F', 'D', 'L', 'B'], // 2 done → currently in middleLayer (index 2)
    })
    render(<StageChipRow />)
    expect(screen.getByTestId('stage-chip-2')).toHaveAttribute('data-state', 'current')
    expect(screen.getByTestId('stage-chip-0')).toHaveAttribute('data-state', 'done')
    expect(screen.getByTestId('stage-chip-5')).toHaveAttribute('data-state', 'future')
  })
})
