import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useCubeStore } from '@/store/cubeStore'
import { ComparePanel } from './ComparePanel'

beforeEach(() => {
  useCubeStore.getState().reset()
  useCubeStore.setState({ lastComparison: null })
})

describe('ComparePanel (RD2-X8)', () => {
  it('renders nothing when no lastComparison', () => {
    const { container } = render(<ComparePanel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders LBL + CFOP totals when comparison present', () => {
    useCubeStore.setState({
      lastComparison: {
        lbl: { totalMoves: 60, segments: [{ name: '白十字', moves: ['R', 'U'] }] },
        cfop: { totalMoves: 50, segments: [{ name: '白十字', moves: ['R'] }] },
      } as unknown as never,
    })
    render(<ComparePanel />)
    const panel = screen.getByTestId('compare-panel')
    expect(panel).toHaveTextContent(/LBL/)
    expect(panel).toHaveTextContent(/CFOP/)
    expect(panel).toHaveTextContent(/60/)
    expect(panel).toHaveTextContent(/50/)
  })

  it('shows winner badge when one method is shorter', () => {
    useCubeStore.setState({
      lastComparison: {
        lbl: { totalMoves: 60, segments: [] },
        cfop: { totalMoves: 50, segments: [] },
      } as unknown as never,
    })
    render(<ComparePanel />)
    expect(screen.getByTestId('compare-winner')).toHaveTextContent(/CFOP.*10|短.*10|10 步/)
  })
})
