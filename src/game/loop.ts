import type { DayLog, Decision, Outcome, Regulation, SeasonLog, ShiftInfo, Ship, ShopItem, Ticket, Tool } from './types'
import { isShiftOver } from './clock'
import { dateOfDay } from './date'
import { revealedBy } from './evidence'
import { generateBlacklist, generateShip } from './generateShip'
import type { Rng } from './random'
import { findIssues, newRegulations, regulationsForDay } from './regulations'
import { BIODIVERSITY, PORT, START_DATE, TOTAL_DAYS } from '../data/start'
import { BLACKLIST, ECONOMY, FALSIFIED_REPORTS, HABITAT_RECOVERY_PER_LEVEL, SHOP } from '../data/economy'

/** `shift` while inspecting; `summary` for the end-of-day ledger and shop. */
export type Phase = 'shift' | 'summary'

/** Everything that changes as the game is played. */
export interface Progress {
  shift: ShiftInfo
  phase: Phase
  /** Real milliseconds played so far in today's shift. */
  elapsedMs: number
  biodiversity: number
  /** The port's operating budget, in dollars. */
  money: number
  ship: Ship
  regulations: Regulation[]
  /** Today's blacklisted vessel names (from Day 3). Every vessel on it is illegal. */
  blacklist: string[]
  /** Shop purchases so far. */
  owned: Record<ShopItem, number>
  /** Inspections used today (free ones first, then paid). */
  inspectionsUsed: number
  /** Tools already used on the ship at the booth; their evidence can be reopened for free. */
  inspected: Tool[]
  /** Evidence currently open, or null. */
  viewing: Tool | null
  /** Show the start-of-day briefing on the regulations new today. The shift clock waits until it's closed. */
  briefing: boolean
  /** Show the Port Authority bulletin about falsified reports (start of Day 4). */
  bulletin: boolean
  /** True from the start of day 2+ until the first decision, to show habitat recovery. */
  newDay: boolean
  /** Shown after a wrong decision until the player dismisses it. */
  ticket: Ticket | null
  /** Today's money and decisions. */
  log: DayLog
  /** Decisions across the whole season. */
  season: SeasonLog
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

const emptyLog = (biodiversity: number): DayLog => ({
  accepted: 0,
  rejected: 0,
  mistakes: 0,
  errors: [],
  revenue: 0,
  fines: 0,
  inspectionFees: 0,
  expense: 0,
  biodiversityStart: biodiversity,
})

export const emptySeason = (): SeasonLog => ({
  vessels: 0,
  illegalRejected: 0,
  illegalAccepted: 0,
  falsifiedAccepted: 0,
  missedByTool: { tracking: 0, catch: 0, license: 0 },
  legalRejected: 0,
})

/** Whether the player can use a verification tool. Vessel Tracking is issued with the Day 4 bulletin. */
export function hasTool(p: Pick<Progress, 'shift' | 'owned'>, tool: Tool): boolean {
  return tool === 'tracking' ? p.shift.day >= FALSIFIED_REPORTS.startDay : p.owned[tool] > 0
}

export function freeInspections(p: Pick<Progress, 'owned'>): number {
  return p.owned.inspector > 0 ? ECONOMY.inspectorFreeInspections : ECONOMY.freeInspections
}

/** What the next inspection costs. */
export function inspectionCost(p: Pick<Progress, 'owned' | 'inspectionsUsed'>): number {
  return p.inspectionsUsed < freeInspections(p) ? 0 : ECONOMY.inspectionCost
}

/** Biodiversity restored at the start of each day by Habitat Restoration. */
export function habitatRecovery(p: Pick<Progress, 'owned'>): number {
  return p.owned.habitat * HABITAT_RECOVERY_PER_LEVEL
}

/** True if the vessel's actual activity breaks no rule. */
export function isLegal(ship: Ship, regulations: Regulation[], ctx: { date: ShiftInfo['date']; biodiversity: number }): boolean {
  return findIssues(ship.actual, regulations, ctx).length === 0
}

/** A decision is correct if it accepts a ship that really broke no rule, or rejects one that broke any. */
export function isCorrectDecision(
  ship: Ship,
  decision: Decision,
  regulations: Regulation[],
  ctx: { date: ShiftInfo['date']; biodiversity: number },
): boolean {
  return isLegal(ship, regulations, ctx) === (decision === 'accept')
}

function nextShip(
  rand: Rng,
  arrivalNo: number,
  shift: ShiftInfo,
  regulations: Regulation[],
  biodiversity: number,
  blacklist: string[],
) {
  // The first vessel after the Day 4 bulletin is the guided example: a report hiding where it fished.
  const guided = shift.day === FALSIFIED_REPORTS.startDay && shift.vesselNumber === 1
  return generateShip(rand, {
    arrivalNo,
    day: shift.day,
    regulations,
    ctx: { date: shift.date, biodiversity },
    requireLie: guided ? 'tracking' : undefined,
    blacklist,
  })
}

export function newGame(rand: Rng): Progress {
  const shift = shiftForDay(1)
  const regulations = regulationsForDay(1)
  const biodiversity = BIODIVERSITY.start
  return {
    shift,
    phase: 'shift',
    elapsedMs: 0,
    biodiversity,
    money: ECONOMY.startMoney,
    regulations,
    blacklist: [],
    ship: nextShip(rand, 1, shift, regulations, biodiversity, []),
    owned: { catch: 0, license: 0, inspector: 0, habitat: 0 },
    inspectionsUsed: 0,
    inspected: [],
    viewing: null,
    briefing: newRegulations(1).length > 0,
    bulletin: false,
    newDay: false,
    ticket: null,
    log: emptyLog(biodiversity),
    season: emptySeason(),
    outcome: null,
  }
}

/**
 * Use a verification tool on the ship at the booth and open its evidence.
 * Reopening evidence already gathered is free. Does nothing if the tool is locked or unaffordable.
 */
export function inspect(p: Progress, tool: Tool): Progress {
  if (p.outcome || p.phase !== 'shift' || !hasTool(p, tool)) return p
  if (p.inspected.includes(tool)) return { ...p, viewing: tool }
  const cost = inspectionCost(p)
  if (p.money < cost) return p
  return {
    ...p,
    money: p.money - cost,
    inspectionsUsed: p.inspectionsUsed + 1,
    inspected: [...p.inspected, tool],
    viewing: tool,
    log: { ...p.log, inspectionFees: p.log.inspectionFees + cost },
  }
}

/**
 * Score a decision on the current ship and bring in the next one.
 * Accepting earns port fees; accepting an illegal ship also costs biodiversity.
 * Rejecting a legal ship draws an industry complaint fine. Wrong decisions issue a ticket.
 */
export function resolveDecision(p: Progress, decision: Decision, rand: Rng): Progress {
  if (p.outcome || p.phase !== 'shift') return p

  const ctx = { date: p.shift.date, biodiversity: p.biodiversity }
  const issues = findIssues(p.ship.actual, p.regulations, ctx)
  const legal = issues.length === 0
  const accept = decision === 'accept'
  const correct = legal === accept

  const revenue = accept ? ECONOMY.acceptRevenue : 0
  const fine = !accept && legal ? ECONOMY.wrongRejectFine : 0
  const biodiversity = accept && !legal ? clamp(p.biodiversity - BIODIVERSITY.wrongPenalty) : p.biodiversity
  const ticket: Ticket | null = correct
    ? null
    : {
        arrivalNo: p.ship.report.arrivalNo,
        vesselName: p.ship.report.vesselName,
        decision,
        issues: p.blacklist.includes(p.ship.report.vesselName)
          ? [`${p.ship.report.vesselName} is on today's blacklist.`, ...issues]
          : issues,
        hidden: p.ship.lies.map((tool) => revealedBy(p.ship, tool)),
        ship: p.ship,
      }
  const log: DayLog = {
    ...p.log,
    accepted: p.log.accepted + (accept ? 1 : 0),
    rejected: p.log.rejected + (accept ? 0 : 1),
    mistakes: p.log.mistakes + (correct ? 0 : 1),
    errors: ticket
      ? [
          ...p.log.errors,
          {
            arrivalNo: ticket.arrivalNo,
            vesselName: ticket.vesselName,
            decision,
            reason: legal
              ? 'Legal vessel: it met every regulation.'
              : `${ticket.issues[0]}${p.ship.lies.length > 0 ? ' (report falsified)' : ''}`,
          },
        ]
      : p.log.errors,
    revenue: p.log.revenue + revenue,
    fines: p.log.fines + fine,
  }
  const falsified = accept && !legal && p.ship.lies.length > 0
  const season: SeasonLog = {
    vessels: p.season.vessels + 1,
    illegalRejected: p.season.illegalRejected + (!accept && !legal ? 1 : 0),
    illegalAccepted: p.season.illegalAccepted + (accept && !legal ? 1 : 0),
    falsifiedAccepted: p.season.falsifiedAccepted + (falsified ? 1 : 0),
    missedByTool: falsified
      ? {
          tracking: p.season.missedByTool.tracking + (p.ship.lies.includes('tracking') ? 1 : 0),
          catch: p.season.missedByTool.catch + (p.ship.lies.includes('catch') ? 1 : 0),
          license: p.season.missedByTool.license + (p.ship.lies.includes('license') ? 1 : 0),
        }
      : p.season.missedByTool,
    legalRejected: p.season.legalRejected + (!accept && legal ? 1 : 0),
  }
  const money = p.money + revenue - fine

  if (biodiversity <= 0) {
    return { ...p, biodiversity: 0, money, log, season, newDay: false, viewing: null, ticket, outcome: 'collapse' }
  }

  const shift = { ...p.shift, vesselNumber: p.shift.vesselNumber + 1 }
  return {
    ...p,
    shift,
    biodiversity,
    money,
    log,
    season,
    ship: nextShip(rand, p.ship.report.arrivalNo + 1, shift, p.regulations, biodiversity, p.blacklist),
    inspected: [],
    viewing: null,
    newDay: false,
    ticket,
  }
}

/**
 * Advance the shift clock. At 5 PM the ship at the booth is sent away and the port pays its
 * operating expense. If it can't, the port is shut down; otherwise the day's summary and shop open
 * (or the game is complete after the last day).
 */
export function advanceTime(p: Progress, ms: number): Progress {
  if (p.outcome || p.phase !== 'shift') return p

  const elapsedMs = p.elapsedMs + ms
  if (!isShiftOver(elapsedMs)) return { ...p, elapsedMs }

  const closed = { ...p, elapsedMs, viewing: null, ticket: null, briefing: false, bulletin: false }
  const expense = ECONOMY.operatingExpense
  if (p.money < expense) return { ...closed, outcome: 'bankrupt' }

  const ended = { ...closed, money: p.money - expense, log: { ...p.log, expense } }
  if (p.shift.day >= TOTAL_DAYS) return { ...ended, outcome: 'complete' }
  return { ...ended, phase: 'summary' }
}

/** Buy a shop item during the end-of-day summary. Does nothing if unavailable or unaffordable. */
export function buy(p: Progress, item: ShopItem): Progress {
  const def = SHOP.find((d) => d.id === item)
  if (!def || p.phase !== 'summary' || p.outcome) return p
  const owned = p.owned[item]
  const price = def.price(owned)
  if (owned >= def.max || p.shift.day < def.fromDay || p.money < price) return p
  return { ...p, money: p.money - price, owned: { ...p.owned, [item]: owned + 1 } }
}

/** Leave the summary and start the next day's shift, restoring biodiversity by Habitat Restoration. */
export function startNextDay(p: Progress, rand: Rng): Progress {
  if (p.outcome || p.phase !== 'summary') return p
  return { ...beginDay(p, p.shift.day + 1, clamp(p.biodiversity + habitatRecovery(p)), rand), newDay: true }
}

/**
 * Debug: start a fresh shift on any day (clamped to 1–12), keeping money, biodiversity and upgrades.
 * Clears any game-over, ticket or open notice. Day 4 still opens with the bulletin and guided example.
 */
export function skipToDay(p: Progress, day: number, rand: Rng): Progress {
  const target = Math.max(1, Math.min(TOTAL_DAYS, Math.round(day)))
  return { ...beginDay(p, target, p.biodiversity, rand), outcome: null }
}

/** The start of a day's shift: its regulations, blacklist, first ship and an empty log. */
function beginDay(p: Progress, day: number, biodiversity: number, rand: Rng): Progress {
  const shift = shiftForDay(day)
  const regulations = regulationsForDay(shift.day)
  const blacklist = shift.day >= BLACKLIST.fromDay ? generateBlacklist(rand) : []
  return {
    ...p,
    phase: 'shift',
    shift,
    elapsedMs: 0,
    biodiversity,
    regulations,
    blacklist,
    ship: nextShip(rand, p.ship.report.arrivalNo + 1, shift, regulations, biodiversity, blacklist),
    inspectionsUsed: 0,
    inspected: [],
    viewing: null,
    briefing: newRegulations(shift.day).length > 0,
    bulletin: shift.day === FALSIFIED_REPORTS.startDay,
    newDay: false,
    ticket: null,
    log: emptyLog(biodiversity),
  }
}
