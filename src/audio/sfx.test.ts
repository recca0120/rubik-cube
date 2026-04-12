import { describe, it, expect, vi, beforeEach } from 'vitest'
import { playSfx, __resetAudioForTest } from './sfx'
import { useCubeStore } from '@/store/cubeStore'

// Stub out AudioContext globally for jsdom.
class MockOscillator {
  frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
  type = 'sine'
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
  onended: (() => void) | null = null
}
class MockGain {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
  connect = vi.fn()
}
class MockAudioContext {
  currentTime = 0
  destination = {}
  state = 'running' as 'running' | 'suspended'
  createOscillator = vi.fn(() => new MockOscillator())
  createGain = vi.fn(() => new MockGain())
  resume = vi.fn().mockResolvedValue(undefined)
}
let lastCtx: MockAudioContext | null = null
beforeEach(() => {
  __resetAudioForTest()
  lastCtx = null
  const CapturingCtx = function () {
    const ctx = new MockAudioContext()
    lastCtx = ctx
    return ctx
  } as unknown as typeof MockAudioContext
  ;(globalThis as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = CapturingCtx
  useCubeStore.getState().setSoundEnabled(false)
})

describe('playSfx', () => {
  it('is a no-op when soundEnabled is false', () => {
    useCubeStore.getState().setSoundEnabled(false)
    playSfx('success')
    expect(lastCtx).toBeNull()
  })

  it('creates an AudioContext + oscillator when enabled', () => {
    useCubeStore.getState().setSoundEnabled(true)
    playSfx('success')
    expect(lastCtx).not.toBeNull()
    expect(lastCtx!.createOscillator).toHaveBeenCalled()
  })

  it('reuses the same AudioContext across calls', () => {
    useCubeStore.getState().setSoundEnabled(true)
    playSfx('success')
    const first = lastCtx
    playSfx('wrong')
    expect(lastCtx).toBe(first)
  })

  it('supports the 4 sound names without throwing', () => {
    useCubeStore.getState().setSoundEnabled(true)
    expect(() => playSfx('success')).not.toThrow()
    expect(() => playSfx('wrong')).not.toThrow()
    expect(() => playSfx('click')).not.toThrow()
    expect(() => playSfx('chapter-done')).not.toThrow()
  })
})
