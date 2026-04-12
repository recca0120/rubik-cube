import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCubeStore } from '@/store/cubeStore'
import { WizardMiniPlayer } from './WizardMiniPlayer'

function resetStore() {
  useCubeStore.getState().reset()
  useCubeStore.setState({ paused: true, stepTokens: 0, history: [], queue: [] })
}

describe('WizardMiniPlayer', () => {
  beforeEach(resetStore)

  it('renders 4 control buttons + progress counter', () => {
    useCubeStore.setState({ queue: ['R', 'U', "R'", "U'"], totalProgram: 4 })
    render(<WizardMiniPlayer total={4} done={0} onRestart={() => {}} />)
    expect(screen.getByTitle('上一步')).toBeInTheDocument()
    expect(screen.getByTitle('自動播放')).toBeInTheDocument()
    expect(screen.getByTitle('下一步')).toBeInTheDocument()
    expect(screen.getByTitle('從頭再看')).toBeInTheDocument()
    expect(screen.getByText('0 / 4')).toBeInTheDocument()
  })

  it('⏭ 下一步 grants one stepToken (forward playback)', async () => {
    const user = userEvent.setup()
    useCubeStore.setState({ queue: ['R'], totalProgram: 1 })
    render(<WizardMiniPlayer total={1} done={0} onRestart={() => {}} />)
    await user.click(screen.getByTitle('下一步'))
    expect(useCubeStore.getState().stepTokens).toBe(1)
  })

  it('⏮ 上一步 pops last history move back onto queue head (reverse)', async () => {
    const user = userEvent.setup()
    // simulate: user has already done 1 move, history=['R'], queue=[]
    useCubeStore.getState().enqueue('R')
    useCubeStore.getState().finishMove() // plays R → history=['R'], queue=[]
    render(<WizardMiniPlayer total={1} done={1} onRestart={() => {}} />)
    await user.click(screen.getByTitle('上一步'))
    const { history, queue } = useCubeStore.getState()
    expect(history).toEqual([])
    expect(queue[0]).toBe('R')
  })

  it('▶ 自動播放 un-pauses + disables step-by-step', async () => {
    const user = userEvent.setup()
    useCubeStore.setState({ queue: ['R', 'U'], totalProgram: 2, paused: true, stepByStep: true })
    render(<WizardMiniPlayer total={2} done={0} onRestart={() => {}} />)
    await user.click(screen.getByTitle('自動播放'))
    const s = useCubeStore.getState()
    expect(s.paused).toBe(false)
    expect(s.stepByStep).toBe(false)
  })

  it('🔄 從頭再看 calls onRestart', async () => {
    const user = userEvent.setup()
    const onRestart = vi.fn()
    render(<WizardMiniPlayer total={4} done={2} onRestart={onRestart} />)
    await user.click(screen.getByTitle('從頭再看'))
    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('上一步 disabled when history is empty', () => {
    render(<WizardMiniPlayer total={4} done={0} onRestart={() => {}} />)
    expect(screen.getByTitle('上一步')).toBeDisabled()
  })

  it('下一步 + 自動播放 disabled when queue is empty', () => {
    useCubeStore.setState({ queue: [] })
    render(<WizardMiniPlayer total={4} done={4} onRestart={() => {}} />)
    expect(screen.getByTitle('下一步')).toBeDisabled()
    expect(screen.getByTitle('自動播放')).toBeDisabled()
  })

  it('forward→backward round trip: step forward N → step back N → cube returns to start', () => {
    // Play 3 moves, then undo 3
    const start = useCubeStore.getState().cube.facelets
    useCubeStore.getState().enqueue("R U R'")
    useCubeStore.getState().finishMove()
    useCubeStore.getState().finishMove()
    useCubeStore.getState().finishMove()
    expect(useCubeStore.getState().cube.facelets).not.toBe(start) // scrambled after 3 moves
    useCubeStore.getState().stepBack()
    useCubeStore.getState().stepBack()
    useCubeStore.getState().stepBack()
    expect(useCubeStore.getState().cube.facelets).toBe(start)
  })
})
