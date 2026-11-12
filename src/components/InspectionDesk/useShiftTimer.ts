import { useEffect } from 'react'

const INTERVAL_MS = 250
/** Cap per tick so time spent in a background tab (where timers are throttled) mostly doesn't count. */
const MAX_TICK_MS = 1000

/** Calls `tick` with elapsed real time while not paused. */
export function useShiftTimer(tick: (ms: number) => void, paused: boolean) {
  useEffect(() => {
    if (paused) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      tick(Math.min(MAX_TICK_MS, now - last))
      last = now
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [tick, paused])
}
