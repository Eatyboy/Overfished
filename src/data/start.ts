import type { GameDate } from '../game/types'

/** Game length in days. Each day is the first of a new month. */
export const TOTAL_DAYS = 12

/** Date of Day 1. */
export const START_DATE: GameDate = { year: 2026, month: 1, day: 1 }

/** Marine Biodiversity: the player's health bar, in percentage points (0–100). */
export const BIODIVERSITY = {
  start: 100,
  max: 100,
  /** Lost for each illegal ship accepted. It does not recover on its own; only Habitat Restoration restores it. */
  wrongPenalty: 10,
}

export const PORT = {
  location: 'Port of San Diego',
  booth: 'Inspection Booth 04',
}

/** Each day is a timed shift: the in-game clock runs 9 AM – 5 PM over a few real minutes. */
export const SHIFT_CLOCK = {
  startHour: 9,
  endHour: 17,
  /** The clock shown to the player moves in steps of this many in-game minutes. */
  stepMinutes: 15,
  /** Real time one day lasts. */
  realMs: 2 * 60 * 1000,
}
