/**
 * Balance simulation: plays the real game loop for all 12 days with simulated players and a grid of
 * economy settings, then prints how each kind of player fares.
 *
 * Skipped in normal test runs. Run it with:
 *   npm run sim
 * The report is written to the path in SIM_OUT (default: balance-sim.txt).
 */
import { writeFileSync } from 'node:fs'
import { describe, it } from 'vitest'
import type { Ship, ShopItem, Tool } from '../src/game/types'
import { advanceTime, buy, hasTool, inspect, inspectionCost, newGame, resolveDecision, startNextDay, type Progress } from '../src/game/loop'
import { findViolations } from '../src/game/regulations'
import { mulberry32, type Rng } from '../src/game/random'
import { ECONOMY, SHOP } from '../src/data/economy'
import { SHIFT_CLOCK, TOTAL_DAYS } from '../src/data/start'

// ---- players ----

interface Player {
  name: string
  /** Real seconds to read a vessel's papers and decide. */
  secondsPerVessel: number
  /** Extra seconds per inspection. */
  secondsPerInspection: number
  /** Chance of misjudging a vessel anyway (misreading a rule, missing the blacklist). */
  errorRate: number
  acceptAll: boolean
  inspects: boolean
  buysTools: boolean
}

const PLAYERS: Player[] = [
  { name: 'careful + tools', secondsPerVessel: 18, secondsPerInspection: 4, errorRate: 0.05, acceptAll: false, inspects: true, buysTools: true },
  { name: 'careful, no shop', secondsPerVessel: 18, secondsPerInspection: 4, errorRate: 0.05, acceptAll: false, inspects: true, buysTools: false },
  { name: 'skims papers', secondsPerVessel: 10, secondsPerInspection: 0, errorRate: 0.15, acceptAll: false, inspects: false, buysTools: false },
  { name: 'accepts everyone', secondsPerVessel: 5, secondsPerInspection: 0, errorRate: 0, acceptAll: true, inspects: false, buysTools: false },
]

// ---- economy settings ----

interface Settings {
  label: string
  revenue: number
  inspection: number
  /** Operating expense charged at the end of each day. */
  expense: (day: number) => number
}

const flat = (n: number) => () => n
const rising = (from: number, to: number) => (day: number) =>
  day < 4 ? from : Math.round(from + ((to - from) * (day - 3)) / (TOTAL_DAYS - 3))

function grid(): Settings[] {
  const expenses: [string, (day: number) => number][] = [
    ['$60', flat(60)],
    ['$80', flat(80)],
    ['$100', flat(100)],
    ['$60→$120', rising(60, 120)],
    ['$80→$150', rising(80, 150)],
  ]
  const out: Settings[] = []
  for (const revenue of [30, 40, 45])
    for (const inspection of [10, 20])
      for (const [name, expense] of expenses)
        out.push({ label: `fee $${revenue} · insp $${inspection} · cost ${name}`, revenue, inspection, expense })
  return out
}

// ---- one game ----

interface Result {
  outcome: 'complete' | 'bankrupt' | 'collapse'
  lastDay: number
  biodiversity: number
  money: number
  moneyBeforeDay4: number
  toolsOwned: number
}

const TOOL_ITEMS: ShopItem[] = ['catch', 'license', 'inspector']

function decideShip(p: Progress, player: Player, rand: Rng): { p: Progress; seconds: number } {
  let seconds = player.secondsPerVessel
  const ship: Ship = p.ship
  const ctx = { date: p.shift.date, biodiversity: p.biodiversity }
  if (player.acceptAll) return { p: resolveDecision(p, 'accept', rand), seconds }

  // What the papers and the blacklist show.
  let suspicious = findViolations(ship, p.regulations, ctx).length > 0 || p.blacklist.includes(ship.report.vesselName)

  // Verify clean-looking papers with every tool on hand, while it stays affordable.
  if (!suspicious && player.inspects) {
    const reserve = ECONOMY.operatingExpense + 20
    for (const tool of ['tracking', 'catch', 'license'] as Tool[]) {
      if (!hasTool(p, tool)) continue
      const cost = inspectionCost(p)
      if (cost > 0 && p.money - cost < reserve) break
      p = inspect(p, tool)
      seconds += player.secondsPerInspection
      if (ship.lies.includes(tool)) {
        suspicious = true
        break
      }
    }
  }

  let decision: 'accept' | 'reject' = suspicious ? 'reject' : 'accept'
  if (rand() < player.errorRate) decision = decision === 'accept' ? 'reject' : 'accept'
  return { p: resolveDecision({ ...p, viewing: null }, decision, rand), seconds }
}

function shop(p: Progress, player: Player, settings: Settings): Progress {
  if (!player.buysTools) return p
  const reserve = settings.expense(p.shift.day + 1) + 40
  for (const item of TOOL_ITEMS) {
    const def = SHOP.find((d) => d.id === item)
    if (!def || p.owned[item] >= def.max || p.shift.day < def.fromDay) continue
    if (p.money - def.price(p.owned[item]) >= reserve) p = buy(p, item)
  }
  const habitat = SHOP.find((d) => d.id === 'habitat')
  if (habitat && p.biodiversity < 60 && p.money - habitat.price(p.owned.habitat) >= reserve) p = buy(p, 'habitat')
  return p
}

function playGame(seed: number, player: Player, settings: Settings): Result {
  const rand = mulberry32(seed)
  let p = newGame(rand)
  let moneyBeforeDay4 = 0
  while (!p.outcome) {
    ECONOMY.operatingExpense = settings.expense(p.shift.day)
    while (p.phase === 'shift' && !p.outcome) {
      const { p: next, seconds } = decideShip(p, player, rand)
      p = next.outcome ? next : advanceTime(next, seconds * 1000)
    }
    if (p.outcome) break
    if (p.shift.day === 3) moneyBeforeDay4 = p.money
    p = startNextDay(shop(p, player, settings), rand)
  }
  return {
    outcome: p.outcome ?? 'complete',
    lastDay: p.shift.day,
    biodiversity: p.biodiversity,
    money: p.money,
    moneyBeforeDay4,
    toolsOwned: TOOL_ITEMS.filter((t) => p.owned[t] > 0).length,
  }
}

// ---- report ----

const RUNS = 300
const pct = (n: number) => `${Math.round(n * 100)}%`.padStart(4)
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

function summarize(results: Result[]) {
  const done = results.filter((r) => r.outcome === 'complete')
  return {
    complete: done.length / results.length,
    bankrupt: results.filter((r) => r.outcome === 'bankrupt').length / results.length,
    collapse: results.filter((r) => r.outcome === 'collapse').length / results.length,
    bio: avg(done.map((r) => r.biodiversity)),
    money: avg(done.map((r) => r.money)),
    day4: avg(results.filter((r) => r.lastDay > 3).map((r) => r.moneyBeforeDay4)),
    tools: avg(done.map((r) => r.toolsOwned)),
    lastDay: avg(results.filter((r) => r.outcome !== 'complete').map((r) => r.lastDay)),
  }
}

describe.skipIf(!process.env.SIM)('balance simulation', () => {
  it('prints outcomes per player and setting', () => {
    const original = { ...ECONOMY }
    const lines: string[] = []
    lines.push(`Day length ${SHIFT_CLOCK.realMs / 1000}s, ${RUNS} games per row.`)
    lines.push('complete / bankrupt / collapse · avg final biodiversity, money (of completers) · money after day 3 · tools owned · avg day lost')
    for (const settings of grid()) {
      ECONOMY.acceptRevenue = settings.revenue
      ECONOMY.inspectionCost = settings.inspection
      lines.push('', settings.label)
      for (const player of PLAYERS) {
        const s = summarize(Array.from({ length: RUNS }, (_, i) => playGame(1000 + i, player, settings)))
        lines.push(
          `  ${player.name.padEnd(17)} ${pct(s.complete)} ${pct(s.bankrupt)} ${pct(s.collapse)}` +
            `  bio ${String(Math.round(s.bio)).padStart(3)}%  $${String(Math.round(s.money)).padStart(4)}` +
            `  day3 $${String(Math.round(s.day4)).padStart(4)}  tools ${s.tools.toFixed(1)}` +
            (s.complete < 1 ? `  lost ~day ${s.lastDay.toFixed(1)}` : ''),
        )
      }
    }
    Object.assign(ECONOMY, original)
    writeFileSync(process.env.SIM_OUT ?? 'balance-sim.txt', lines.join('\n') + '\n')
  }, 120_000)
})
