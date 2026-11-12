import type { Decision, Outcome, Regulation, ShiftInfo, Ship, Ticket } from './types'
import { isShiftOver } from './clock'
import { dateOfDay } from './date'
import { generateShip } from './generateShip'
import type { Rng } from './random'
import { findIssues, regulationsForDay } from './regulations'
import { BIODIVERSITY, PORT, START_DATE, TOTAL_DAYS } from '../data/start'

/** Everything that changes as the game is played. */
export interface Progress {
  shift: ShiftInfo
  /** Real milliseconds played so far in today's shift. */
  elapsedMs: number
  biodiversity: number
  ship: Ship
  regulations: Regulation[]
  /** True from the start of day 2+ until the first decision, to show the daily recovery. */
  newDay: boolean
  /** Shown after a wrong decision until the player dismisses it. */
  ticket: Ticket | null
  /** Set once the game is over. */
  outcome: Outcome | null
}

export function shiftForDay(day: number): ShiftInfo {
  return {
    day,
    date: dateOfDay(START_DATE, day),
    location: PORT.location,
    booth: PORT.booth,
    order: day,
    vesselNumber: 1,
  }
}

const clamp = (n: number) => Math.max(0, Math.min(BIODIVERSITY.max, n))

/** A decision is correct if it accepts a ship that breaks no rule, or rejects one that breaks any. */
export function isCorrectDecision(
  ship: Ship,
  decision: Decision,
  regulations: Regulation[],
  ctx: { date: ShiftInfo['date']; biodiversity: number },
): boolean {
  const legal = findIssues(ship, regulations, ctx).length === 0
  return legal === (decision === 'accept')
}

function nextShip(rand: Rng, arrivalNo: number, shift: ShiftInfo, regulations: Regulation[], biodiversity: number) {
  return generateShip(rand, { arrivalNo, regulations, ctx: { date: shift.date, biodiversity } })
}

export function newGame(rand: Rng): Progress {
  const shift = shiftForDay(1)
  const regulations = regulationsForDay(1)
  const biodiversity = BIODIVERSITY.start
  return {
    shift,
    elapsedMs: 0,
    biodiversity,
    regulations,
    ship: nextShip(rand, 1, shift, regulations, biodiversity),
    newDay: false,
    ticket: null,
    outcome: null,
  }
}

/**
 * Score a decision on the current ship and bring in the next one.
 * A wrong decision costs biodiversity and issues a ticket.
 */
export function resolveDecision(p: Progress, decision: Decision, rand: Rng): Progress {
  if (p.outcome) return p

  const issues = findIssues(p.ship, p.regulations, { date: p.shift.date, biodiversity: p.biodiversity })
  const correct = (issues.length === 0) === (decision === 'accept')
  const ticket: Ticket | null = correct
    ? null
    : { arrivalNo: p.ship.report.arrivalNo, vesselName: p.ship.report.vesselName, decision, issues }
  const biodiversity = correct ? p.biodiversity : clamp(p.biodiversity - BIODIVERSITY.wrongPenalty)

  if (biodiversity <= 0) {
    return { ...p, biodiversity: 0, newDay: false, ticket, outcome: 'collapse' }
  }

  const shift = { ...p.shift, vesselNumber: p.shift.vesselNumber + 1 }
  return {
    ...p,
    shift,
    biodiversity,
    ship: nextShip(rand, p.ship.report.arrivalNo + 1, shift, p.regulations, biodiversity),
    newDay: false,
    ticket,
  }
}

/**
 * Advance the shift clock. When the shift ends at 5 PM the ship at the booth is sent away
 * undecided and the next day begins (restoring biodiversity), or the game is complete.
 */
export function advanceTime(p: Progress, ms: number, rand: Rng): Progress {
  if (p.outcome) return p

  const elapsedMs = p.elapsedMs + ms
  if (!isShiftOver(elapsedMs)) return { ...p, elapsedMs }

  if (p.shift.day >= TOTAL_DAYS) return { ...p, elapsedMs, outcome: 'complete' }

  const shift = shiftForDay(p.shift.day + 1)
  const regulations = regulationsForDay(shift.day)
  const biodiversity = clamp(p.biodiversity + BIODIVERSITY.dailyRecovery)
  return {
    ...p,
    shift,
    elapsedMs: 0,
    biodiversity,
    regulations,
    ship: nextShip(rand, p.ship.report.arrivalNo + 1, shift, regulations, biodiversity),
    newDay: true,
    ticket: null,
  }
}
