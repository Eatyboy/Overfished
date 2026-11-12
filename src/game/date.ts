import type { GameDate } from './types'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Display format used on documents, e.g. "01 JAN 2026". */
export function formatDate({ year, month, day }: GameDate): string {
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`
}

/** Negative if a is before b, 0 if equal, positive if after. */
export function compareDates(a: GameDate, b: GameDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day
}

/** Shift a date by whole months, keeping the day of month (clamped to 28). */
export function addMonths(date: GameDate, months: number): GameDate {
  const index = date.year * 12 + (date.month - 1) + months
  return { year: Math.floor(index / 12), month: (index % 12) + 1, day: Math.min(date.day, 28) }
}

/** Date of a given game day. Day 1 is the start date; each later day is the 1st of the next month. */
export function dateOfDay(start: GameDate, day: number): GameDate {
  return { ...addMonths(start, day - 1), day: 1 }
}
