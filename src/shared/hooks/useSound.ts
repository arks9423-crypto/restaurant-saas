import { useCallback, useRef } from 'react'

function createNewOrderSound(ctx: AudioContext): AudioBufferSourceNode {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  const now = ctx.currentTime
  oscillator.type = 'square'
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  oscillator.frequency.setValueAtTime(880, now)
  oscillator.frequency.setValueAtTime(1100, now + 0.1)
  oscillator.frequency.setValueAtTime(880, now + 0.2)
  oscillator.frequency.setValueAtTime(1320, now + 0.3)

  oscillator.start(now)
  oscillator.stop(now + 0.5)
  return oscillator as unknown as AudioBufferSourceNode
}

function createOrderReadySound(ctx: AudioContext): void {
  const now = ctx.currentTime
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.15
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.start(t)
    osc.stop(t + 0.35)
  })
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playNewOrder = useCallback(() => {
    try {
      const ctx = getCtx()
      for (let i = 0; i < 3; i++) {
        setTimeout(() => createNewOrderSound(ctx), i * 600)
      }
    } catch {}
  }, [getCtx])

  const playOrderReady = useCallback(() => {
    try {
      const ctx = getCtx()
      createOrderReadySound(ctx)
    } catch {}
  }, [getCtx])

  return { playNewOrder, playOrderReady }
}
