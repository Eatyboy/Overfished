import { describe, expect, it } from 'vitest'
import { advanceTime, isCorrectDecision, newGame, resolveDecision, type Progress } from './loop'
import { CLOCK_STEPS, STEP_MS, clockMinutes, formatClock } from './clock'
import { mulberry32 } from './random'
import { BIODIVERSITY, SHIFT_CLOCK, TOTAL_DAYS } from '../data/start'
import type { Decision } from './types'

const DAY_MS = SHIFT_CLOCK.realMs

const isLegal = (p: Progress) =>
  isCorrectDecision(p.ship, 'accept', p.regulations, { date: p.shift.date, biodiversity: p.biodiversity })

/** The decision that is right (or wrong) for the ship currently at the booth. */
function decisionFor(p: Progress, correct: boolean): Decision {
  return isLegal(p) === correct ? 'accept' : 'reject'
}

function play(p: Progress, correct: boolean, times: number, seed = 1): Progress {
  const rand = mulberry32(seed)
  for (let i = 0; i < times; i++) p = resolveDecision(p, decisionFor(p, correct), rand)
  return p
}

/** Run the clock to the end of the current day. */
const endDay = (p: Progress) => advanceTime(p, DAY_MS - p.elapsedMs, mulberry32(9))

describe('shift clock', () => {
  it('runs 9 AM to 5 PM in 30-minute steps over 4 minutes', () => {
    expect(CLOCK_STEPS).toBe(16)
    expect(STEP_MS).toBe(15_000)
    expect(DAY_MS).toBe(240_000)
  })

  it('shows the time in half-hour steps', () => {
    expect(formatClock(clockMinutes(0))).toBe('9:00 AM')
    expect(formatClock(clockMinutes(14_999))).toBe('9:00 AM')
    expect(formatClock(clockMinutes(15_000))).toBe('9:30 AM')
    expect(formatClock(clockMinutes(6 * 15_000))).toBe('12:00 PM')
    expect(formatClock(clockMinutes(7 * 15_000))).toBe('12:30 PM')
    expect(formatClock(clockMinutes(DAY_MS))).toBe('5:00 PM')
    expect(formatClock(clockMinutes(DAY_MS * 2))).toBe('5:00 PM')
  })
})

describe('game loop', () => {
  it('starts on day 1 at 9 AM with full biodiversity', () => {
    const p = newGame(mulberry32(1))
    expect(p.shift.day).toBe(1)
    expect(p.elapsedMs).toBe(0)
    expect(p.biodiversity).toBe(BIODIVERSITY.start)
    expect(p.outcome).toBeNull()
  })

  it('keeps biodiversity on a correct decision and brings in the next ship', () => {
    const p = play(newGame(mulberry32(1)), true, 1)
    expect(p.biodiversity).toBe(BIODIVERSITY.start)
    expect(p.shift.vesselNumber).toBe(2)
    expect(p.ship.report.arrivalNo).toBe(2)
    expect(p.ticket).toBeNull()
  })

  it('lowers biodiversity on a wrong decision', () => {
    const p = play(newGame(mulberry32(1)), false, 2)
    expect(p.biodiversity).toBe(BIODIVERSITY.start - 2 * BIODIVERSITY.wrongPenalty)
  })

  it('does not end the day no matter how many ships are processed', () => {
    const p = play(newGame(mulberry32(1)), true, 50)
    expect(p.shift.day).toBe(1)
    expect(p.shift.vesselNumber).toBe(51)
  })

  it('ends the day when the clock reaches 5 PM, restoring biodiversity', () => {
    let p = play(newGame(mulberry32(1)), false, 3) // 70%
    p = advanceTime(p, DAY_MS - 1, mulberry32(2))
    expect(p.shift.day).toBe(1)

    p = advanceTime(p, 1, mulberry32(2))
    expect(p.shift.day).toBe(2)
    expect(p.shift.vesselNumber).toBe(1)
    expect(p.elapsedMs).toBe(0)
    expect(p.biodiversity).toBe(70 + BIODIVERSITY.dailyRecovery)
    expect(p.newDay).toBe(true)

    p = play(p, true, 1)
    expect(p.newDay).toBe(false)
  })

  it('caps the daily recovery at the max', () => {
    expect(endDay(newGame(mulberry32(1))).biodiversity).toBe(BIODIVERSITY.max)
  })

  it('sends away the ship at the booth when the day ends', () => {
    const p = newGame(mulberry32(1))
    const next = endDay(p)
    expect(next.ship.report.arrivalNo).toBe(p.ship.report.arrivalNo + 1)
    expect(next.biodiversity).toBe(p.biodiversity)
  })

  it('completes when the last day ends', () => {
    let p = newGame(mulberry32(1))
    for (let d = 1; d < TOTAL_DAYS; d++) p = endDay(p)
    expect(p.shift.day).toBe(TOTAL_DAYS)
    expect(p.outcome).toBeNull()
    p = endDay(p)
    expect(p.outcome).toBe('complete')
  })

  it('tickets a wrongly accepted ship with what the player missed', () => {
    let seed = 0
    let p = newGame(mulberry32(seed))
    while (isLegal(p)) p = newGame(mulberry32(++seed))

    const next = resolveDecision(p, 'accept', mulberry32(1))
    expect(next.ticket).toMatchObject({ arrivalNo: 1, vesselName: p.ship.report.vesselName, decision: 'accept' })
    expect(next.ticket!.issues.length).toBeGreaterThan(0)
  })

  it('tickets a wrongly rejected legal ship with no issues', () => {
    let seed = 0
    let p = newGame(mulberry32(seed))
    while (!isLegal(p)) p = newGame(mulberry32(++seed))
    expect(resolveDecision(p, 'reject', mulberry32(1)).ticket).toMatchObject({ decision: 'reject', issues: [] })
  })

  it('collapses when biodiversity reaches 0', () => {
    const p = play(newGame(mulberry32(1)), false, BIODIVERSITY.start / BIODIVERSITY.wrongPenalty)
    expect(p.biodiversity).toBe(0)
    expect(p.outcome).toBe('collapse')
  })

  it('ignores decisions and time once the game is over', () => {
    const over = play(newGame(mulberry32(1)), false, BIODIVERSITY.start / BIODIVERSITY.wrongPenalty)
    expect(resolveDecision(over, 'accept', mulberry32(2))).toBe(over)
    expect(advanceTime(over, 1000, mulberry32(2))).toBe(over)
  })
})
