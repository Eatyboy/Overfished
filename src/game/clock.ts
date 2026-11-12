import { SHIFT_CLOCK } from '../data/start'

const { startHour, endHour, stepMinutes, realMs } = SHIFT_CLOCK

/** Number of clock steps in a day (16 for 9 AM – 5 PM in 30-minute steps). */
export const CLOCK_STEPS = ((endHour - startHour) * 60) / stepMinutes

/** Real milliseconds per clock step (15 s for a 4-minute day). */
export const STEP_MS = realMs / CLOCK_STEPS

/** In-game minutes since midnight shown on the clock, after `elapsedMs` of the shift. */
export function clockMinutes(elapsedMs: number): number {
  const steps = Math.min(CLOCK_STEPS, Math.floor(elapsedMs / STEP_MS))
  return startHour * 60 + steps * stepMinutes
}

/** e.g. "9:00 AM", "12:30 PM", "5:00 PM". */
export function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const h12 = ((h24 + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

export function isShiftOver(elapsedMs: number): boolean {
  return elapsedMs >= realMs
}
