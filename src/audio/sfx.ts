import { useCubeStore } from '@/store/cubeStore'

export type SfxName = 'success' | 'wrong' | 'click' | 'chapter-done'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = (globalThis as { AudioContext?: typeof AudioContext }).AudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  return ctx
}

/** Play a short synth beep. No-op when soundEnabled is false. */
export function playSfx(name: SfxName) {
  if (!useCubeStore.getState().soundEnabled) return
  const c = getCtx()
  if (!c) return
  // Resume context if suspended (autoplay policy).
  if (c.state === 'suspended') void c.resume()

  const now = c.currentTime
  switch (name) {
    case 'success':
      tone(c, 880, 0.15, now, 'sine', 0.18)
      tone(c, 1320, 0.18, now + 0.08, 'sine', 0.16)
      break
    case 'wrong':
      tone(c, 220, 0.20, now, 'sawtooth', 0.18, 110)
      break
    case 'click':
      tone(c, 600, 0.05, now, 'sine', 0.12)
      break
    case 'chapter-done':
      tone(c, 523, 0.18, now, 'triangle', 0.18)
      tone(c, 659, 0.18, now + 0.12, 'triangle', 0.18)
      tone(c, 784, 0.30, now + 0.24, 'triangle', 0.20)
      break
  }
}

function tone(
  c: AudioContext,
  freq: number,
  duration: number,
  start: number,
  type: OscillatorType,
  gainPeak: number,
  rampTo?: number,
) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (rampTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(rampTo, start + duration)
  }
  gain.gain.setValueAtTime(gainPeak, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Test-only: drop the cached AudioContext so each test gets a fresh stub. */
export function __resetAudioForTest() {
  ctx = null
}
