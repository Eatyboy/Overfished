import { describe, expect, it } from 'vitest'
import {
  advanceTime,
  buy,
  freeInspections,
  inspect,
  isLegal,
  newGame,
  resolveDecision,
  startNextDay,
  type Progress,
} from './loop'
import { CLOCK_STEPS, STEP_MS, clockMinutes, formatClock } from './clock'
import { mulberry32 } from './random'
import { BIODIVERSITY, SHIFT_CLOCK, TOTAL_DAYS } from '../data/start'
import { ECONOMY, FALSIFIED_REPORTS, HABITAT_RECOVERY_PER_LEVEL } from '../data/economy'
import type { Decision } from './types'

const DAY_MS = SHIFT_CLOCK.realMs

const legalNow = (p: Progress) => isLegal(p.ship, p.regulations, { date: p.shift.date, biodiversity: p.biodiversity })

/** The decision that is right (or wrong) for the ship currently at the booth. */
const decisionFor = (p: Progress, correct: boolean): Decision => (legalNow(p) === correct ? 'accept' : 'reject')

function play(p: Progress, correct: boolean, times: number, seed = 1): Progress {
  const rand = mulberry32(seed)
  for (let i = 0; i < times; i++) p = resolveDecision(p, decisionFor(p, correct), rand)
  return p
}

/** Run the clock to 5 PM. */
const endDay = (p: Progress) => advanceTime(p, DAY_MS - p.elapsedMs)

/** End the day and start the next one, topping up money so the port never goes broke. */
const nextDay = (p: Progress) => startNextDay(endDay({ ...p, money: Math.max(p.money, 1000) }), mulberry32(9))

/** A new game whose first ship is legal (or illegal). */
function gameWith(legal: boolean): Progress {
  let seed = 0
  let p = newGame(mulberry32(seed))
  while (legalNow(p) !== legal) p = newGame(mulberry32(++seed))
  return p
}

describe('shift clock', () => {
  it('runs 9 AM to 5 PM in 30-minute steps over 3 minutes', () => {
    expect(CLOCK_STEPS).toBe(16)
    expect(STEP_MS).toBe(11_250)
    expect(DAY_MS).toBe(180_000)
  })

  it('shows the time in half-hour steps', () => {
    expect(formatClock(clockMinutes(0))).toBe('9:00 AM')
    expect(formatClock(clockMinutes(11_249))).toBe('9:00 AM')
    expect(formatClock(clockMinutes(11_250))).toBe('9:30 AM')
    expect(formatClock(clockMinutes(6 * 11_250))).toBe('12:00 PM')
    expect(formatClock(clockMinutes(7 * 11_250))).toBe('12:30 PM')
    expect(formatClock(clockMinutes(DAY_MS))).toBe('5:00 PM')
    expect(formatClock(clockMinutes(DAY_MS * 2))).toBe('5:00 PM')
  })
})

describe('decisions', () => {
  it('starts on day 1 at 9 AM with full biodiversity and the starting budget', () => {
    const p = newGame(mulberry32(1))
    expect(p.shift.day).toBe(1)
    expect(p.elapsedMs).toBe(0)
    expect(p.biodiversity).toBe(BIODIVERSITY.start)
    expect(p.money).toBe(ECONOMY.startMoney)
    expect(p.outcome).toBeNull()
  })

  it('earns port fees for accepting a legal vessel', () => {
    const p = resolveDecision(gameWith(true), 'accept', mulberry32(1))
    expect(p.money).toBe(ECONOMY.startMoney + ECONOMY.acceptRevenue)
    expect(p.biodiversity).toBe(BIODIVERSITY.start)
    expect(p.ticket).toBeNull()
    expect(p.ship.report.arrivalNo).toBe(2)
  })

  it('earns port fees but costs biodiversity for accepting an illegal vessel, with a ticket', () => {
    const start = gameWith(false)
    const p = resolveDecision(start, 'accept', mulberry32(1))
    expect(p.money).toBe(ECONOMY.startMoney + ECONOMY.acceptRevenue)
    expect(p.biodiversity).toBe(BIODIVERSITY.start - BIODIVERSITY.wrongPenalty)
    expect(p.ticket).toMatchObject({ arrivalNo: 1, vesselName: start.ship.report.vesselName, decision: 'accept' })
    expect(p.ticket!.issues.length).toBeGreaterThan(0)
  })

  it('fines a wrongly rejected legal vessel without touching biodiversity', () => {
    const p = resolveDecision(gameWith(true), 'reject', mulberry32(1))
    expect(p.money).toBe(ECONOMY.startMoney - ECONOMY.wrongRejectFine)
    expect(p.biodiversity).toBe(BIODIVERSITY.start)
    expect(p.ticket).toMatchObject({ decision: 'reject', issues: [] })
  })

  it('earns nothing and loses nothing for rejecting an illegal vessel', () => {
    const p = resolveDecision(gameWith(false), 'reject', mulberry32(1))
    expect(p.money).toBe(ECONOMY.startMoney)
    expect(p.ticket).toBeNull()
  })

  it('keeps a day log', () => {
    const p = play(newGame(mulberry32(1)), true, 6)
    expect(p.log.accepted + p.log.rejected).toBe(6)
    expect(p.log.mistakes).toBe(0)
    expect(p.log.revenue).toBe(p.log.accepted * ECONOMY.acceptRevenue)
  })

  it('collapses when biodiversity reaches 0', () => {
    let p = newGame(mulberry32(1))
    const rand = mulberry32(5)
    while (!p.outcome) p = resolveDecision(p, legalNow(p) ? 'reject' : 'accept', rand)
    expect(p.biodiversity).toBe(0)
    expect(p.outcome).toBe('collapse')
    expect(resolveDecision(p, 'accept', rand)).toBe(p)
    expect(advanceTime(p, 1000)).toBe(p)
  })
})

describe('days', () => {
  it('pays the operating expense at 5 PM and opens the summary', () => {
    let p = advanceTime(newGame(mulberry32(1)), DAY_MS - 1)
    expect(p.phase).toBe('shift')
    p = advanceTime(p, 1)
    expect(p.phase).toBe('summary')
    expect(p.money).toBe(ECONOMY.startMoney - ECONOMY.operatingExpense)
    expect(p.log.expense).toBe(ECONOMY.operatingExpense)
  })

  it('shuts the port down if it cannot pay the operating expense', () => {
    const p = endDay({ ...newGame(mulberry32(1)), money: ECONOMY.operatingExpense - 1 })
    expect(p.outcome).toBe('bankrupt')
  })

  it('does not recover biodiversity on its own', () => {
    const p = nextDay(play(newGame(mulberry32(1)), false, 6))
    expect(p.shift.day).toBe(2)
    expect(p.biodiversity).toBeLessThan(BIODIVERSITY.start)
    expect(p.biodiversity).toBe(p.log.biodiversityStart)
  })

  it('starts the next day fresh after the summary', () => {
    const p = nextDay(play(newGame(mulberry32(1)), true, 4))
    expect(p.phase).toBe('shift')
    expect(p.shift.day).toBe(2)
    expect(p.shift.vesselNumber).toBe(1)
    expect(p.elapsedMs).toBe(0)
    expect(p.inspectionsUsed).toBe(0)
    expect(p.log.accepted + p.log.rejected).toBe(0)
  })

  it('completes when the last day ends', () => {
    let p = newGame(mulberry32(1))
    for (let d = 1; d < TOTAL_DAYS; d++) p = nextDay(p)
    expect(p.shift.day).toBe(TOTAL_DAYS)
    p = endDay({ ...p, money: 1000 })
    expect(p.outcome).toBe('complete')
  })
})

describe('verification', () => {
  const toDay = (day: number) => {
    let p = newGame(mulberry32(1))
    while (p.shift.day < day) p = nextDay(p)
    return p
  }

  it('posts a blacklist from day 3, fresh each day', () => {
    let p = newGame(mulberry32(1))
    expect(p.blacklist).toEqual([])
    p = nextDay(p)
    expect(p.blacklist).toEqual([])
    p = nextDay(p)
    expect(p.shift.day).toBe(3)
    expect(p.blacklist.length).toBeGreaterThanOrEqual(5)
    const day3 = p.blacklist
    p = startNextDay(endDay({ ...p, money: 1000 }), mulberry32(10))
    expect(p.blacklist.length).toBeGreaterThanOrEqual(5)
    expect(p.blacklist).not.toEqual(day3)
  })

  it('tickets an accepted blacklisted vessel, saying it was on the blacklist', () => {
    let p = toDay(3)
    const rand = mulberry32(7)
    while (!p.blacklist.includes(p.ship.report.vesselName)) p = { ...resolveDecision(p, 'reject', rand), ticket: null }
    const name = p.ship.report.vesselName
    p = resolveDecision(p, 'accept', rand)
    expect(p.ticket!.issues[0]).toBe(`${name} is on today's blacklist.`)
  })

  it('has no tools before day 4', () => {
    const p = toDay(3)
    expect(inspect(p, 'tracking')).toBe(p)
  })

  it('opens day 4 with the bulletin and a vessel whose report hides where it fished', () => {
    const p = toDay(FALSIFIED_REPORTS.startDay)
    expect(p.bulletin).toBe(true)
    expect(p.ship.lies).toEqual(['tracking'])
  })

  it('gives free inspections, then charges for each one', () => {
    let p = { ...toDay(4), money: 100 }
    const rand = mulberry32(3)
    for (let i = 0; i < freeInspections(p); i++) {
      p = inspect(p, 'tracking')
      expect(p.money).toBe(100)
      p = resolveDecision(p, 'reject', rand)
    }
    const money = p.money
    p = inspect(p, 'tracking')
    expect(p.money).toBe(money - ECONOMY.inspectionCost)
    expect(p.viewing).toBe('tracking')
  })

  it('lets evidence be reopened for free', () => {
    let p = inspect(toDay(4), 'tracking')
    p = inspect({ ...p, viewing: null }, 'tracking')
    expect(p.inspectionsUsed).toBe(1)
    expect(p.viewing).toBe('tracking')
  })

  it('refuses a paid inspection the port cannot afford', () => {
    const p = { ...toDay(4), inspectionsUsed: 99, money: ECONOMY.inspectionCost - 1 }
    expect(inspect(p, 'tracking')).toBe(p)
  })

  it('tickets an accepted falsified report with what tracking would have shown', () => {
    const p = resolveDecision(toDay(4), 'accept', mulberry32(1))
    expect(p.ticket!.hidden).toHaveLength(1)
    expect(p.ticket!.hidden[0]).toMatch(/^Vessel Tracking: the vessel was really in/)
  })
})

describe('shop', () => {
  const summaryOn = (day: number, money = 1000): Progress => {
    let p = newGame(mulberry32(1))
    while (p.shift.day < day) p = nextDay(p)
    return { ...endDay({ ...p, money: money + ECONOMY.operatingExpense }) }
  }

  it('sells catch verification from day 4 and unlocks the tool', () => {
    expect(buy(summaryOn(3), 'catch').owned.catch).toBe(0)
    const p = buy(summaryOn(4), 'catch')
    expect(p.owned.catch).toBe(1)
    expect(p.money).toBe(1000 - 150)
    expect(inspect(startNextDay(p, mulberry32(1)), 'catch').viewing).toBe('catch')
  })

  it('refuses purchases the port cannot afford', () => {
    const p = summaryOn(4, 50)
    expect(buy(p, 'license')).toBe(p)
  })

  it('raises free inspections with an additional inspector', () => {
    expect(freeInspections(buy(summaryOn(4), 'inspector'))).toBe(ECONOMY.inspectorFreeInspections)
  })

  it('restores biodiversity gradually with habitat restoration, and gets pricier', () => {
    let p = { ...summaryOn(1), biodiversity: 50 }
    p = buy(p, 'habitat')
    expect(p.money).toBe(900)
    p = buy(p, 'habitat')
    expect(p.money).toBe(750)
    p = startNextDay(p, mulberry32(1))
    expect(p.biodiversity).toBe(50 + 2 * HABITAT_RECOVERY_PER_LEVEL)
  })
})
