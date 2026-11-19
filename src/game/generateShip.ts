import type { CatchEntry, Documents, InspectionContext, Permit, Regulation, Ship, Tool } from './types'
import { addMonths } from './date'
import { pick, pickDistinct, randInt, type Rng } from './random'
import { findViolations } from './regulations'
import {
  BAIT,
  FISHING_REGIONS,
  PERMITS,
  SPECIES,
  VESSEL_ADJECTIVES,
  VESSEL_NOUNS,
} from '../data/pools'
import { BLACKLIST, FALSIFIED_REPORTS } from '../data/economy'

interface GenerateOptions {
  arrivalNo: number
  /** Game day (1–12): decides whether, and how, vessels lie. */
  day: number
  /** The day's regulations and inspection context, used to balance legal vs. illegal ships. */
  regulations: Regulation[]
  ctx: InspectionContext
  /** Chance the ship's actual activity complies with every rule. Defaults to 0.5. */
  legalChance?: number
  /** Force an illegal ship whose report hides its violation with this kind of lie (the guided example). */
  requireLie?: Tool
  /** Today's blacklisted vessel names. Illegal ships sometimes carry one; legal ships never do. */
  blacklist?: readonly string[]
}

/** Resampling cap; if no ship of the wanted kind turns up, the last one is used. */
const MAX_TRIES = 100

const TOOLS: Tool[] = ['tracking', 'catch', 'license']
const SAN_DIEGO = FISHING_REGIONS.filter((r) => r.sanDiego).map((r) => r.name)

export function generateVesselName(rand: Rng): string {
  return `The ${pick(rand, VESSEL_ADJECTIVES)} ${pick(rand, VESSEL_NOUNS)}`
}

/** A day's blacklist: distinct vessel names, sized by BLACKLIST.size. */
export function generateBlacklist(rand: Rng): string[] {
  const size = randInt(rand, ...BLACKLIST.size)
  const names = new Set<string>()
  while (names.size < size) names.add(generateVesselName(rand))
  return [...names]
}

function generateCatch(rand: Rng): CatchEntry[] {
  return pickDistinct(rand, SPECIES, randInt(rand, 1, 3)).map((s) => ({
    species: s.name,
    amount: randInt(rand, ...s.amount),
    unit: s.unit,
    sizeIn: randInt(rand, ...s.sizeIn),
    gear: pick(rand, s.gear),
  }))
}

/** One fully random set of documents. The license always matches the report and is valid on arrival. */
export function randomDocuments(rand: Rng, arrivalNo: number, ctx: InspectionContext): Documents {
  const vesselName = generateVesselName(rand)
  const permits: Permit[] = PERMITS.filter(() => rand() < 0.5)

  return {
    report: {
      arrivalNo,
      vesselName,
      fishingRegion: pick(rand, FISHING_REGIONS).name,
      catches: generateCatch(rand),
      bait: rand() < 0.25 ? null : pick(rand, BAIT),
    },
    license: {
      vesselName,
      licenseNumber: `L-${String(randInt(rand, 0, 999999)).padStart(6, '0')}`,
      expires: { ...addMonths(ctx.date, randInt(rand, 1, 24)), day: randInt(rand, 1, 28) },
      permits,
    },
  }
}

const clone = (d: Documents): Documents => ({
  report: { ...d.report, catches: d.report.catches.map((c) => ({ ...c })) },
  license: { ...d.license, permits: [...d.license.permits] },
})

/** Edits that make paperwork hide a violation, one per tool that could expose it. */
const LIES: Record<Tool, (rand: Rng, docs: Documents, regulations: Regulation[], ctx: InspectionContext) => void> = {
  // Claim to have fished in San Diego waters.
  tracking: (rand, docs) => {
    if (!SAN_DIEGO.includes(docs.report.fishingRegion)) docs.report.fishingRegion = pick(rand, SAN_DIEGO)
  },
  // Leave illegal catches and bait off the report.
  catch: (rand, docs, regulations, ctx) => {
    const legal = docs.report.catches.filter(
      (c) => findViolations({ ...docs, report: { ...docs.report, catches: [c], bait: null } }, regulations, ctx).length === 0,
    )
    if (legal.length > 0) docs.report.catches = legal
    if (docs.report.bait === 'Tilapia') docs.report.bait = rand() < 0.5 ? null : 'Squid'
  },
  // Show a forged license claiming every permit.
  license: (_rand, docs) => {
    docs.license.permits = [...PERMITS]
  },
}

/**
 * Try to dress up an illegal vessel's documents so they pass every rule, using only the allowed lies.
 * Returns the falsified paperwork and the lies told, or null if the violation can't be hidden.
 */
function falsify(
  rand: Rng,
  actual: Documents,
  allowed: Tool[],
  regulations: Regulation[],
  ctx: InspectionContext,
): { shown: Documents; lies: Tool[] } | null {
  let shown = clone(actual)
  const lies: Tool[] = []
  const count = (d: Documents) => findViolations(d, regulations, ctx).length
  // Tracking first (a bad region makes every catch look illegal), then the others in random order.
  const order: Tool[] = allowed.includes('tracking') ? ['tracking'] : []
  order.push(...pickDistinct(rand, allowed.filter((t) => t !== 'tracking'), allowed.length))

  for (const tool of order) {
    if (count(shown) === 0) break
    const next = clone(shown)
    LIES[tool](rand, next, regulations, ctx)
    if (count(next) < count(shown)) {
      shown = next
      lies.push(tool)
    }
  }
  return count(shown) === 0 ? { shown, lies } : null
}

/** A harmless mismatch on a legal vessel: a different San Diego fishing ground, or a slightly off catch weight. */
function innocentDiscrepancy(rand: Rng, shown: Documents, allowed: Tool[]): Documents {
  const actual = clone(shown)
  const otherGround = SAN_DIEGO.filter((r) => r !== shown.report.fishingRegion)
  if (allowed.includes('catch') && rand() < 0.5) {
    const c = pick(rand, actual.report.catches)
    c.amount = Math.max(1, Math.round(c.amount * (1 + (rand() < 0.5 ? -1 : 1) * (0.05 + rand() * 0.1))))
  } else if (SAN_DIEGO.includes(shown.report.fishingRegion)) {
    actual.report.fishingRegion = pick(rand, otherGround)
  }
  return actual
}

function priorViolations(rand: Rng, lied: boolean, legal: boolean): number {
  if (lied) return rand() < 0.7 ? randInt(rand, 1, 3) : 0
  if (!legal) return rand() < 0.35 ? randInt(rand, 1, 2) : 0
  return rand() < 0.15 ? 1 : 0
}

/** Random documents that are legal (or illegal), resampling up to MAX_TRIES times. */
function randomActual(rand: Rng, opts: GenerateOptions, wantLegal: boolean): Documents {
  const { arrivalNo, regulations, ctx } = opts
  let actual = randomDocuments(rand, arrivalNo, ctx)
  for (let i = 1; i < MAX_TRIES; i++) {
    if ((findViolations(actual, regulations, ctx).length === 0) === wantLegal) break
    actual = randomDocuments(rand, arrivalNo, ctx)
  }
  return actual
}

function buildShip(rand: Rng, opts: GenerateOptions): Ship {
  const { day, regulations, ctx, legalChance = 0.5, requireLie } = opts
  const wantLegal = requireLie ? false : rand() < legalChance
  let actual = randomActual(rand, opts, wantLegal)
  const legal = findViolations(actual, regulations, ctx).length === 0

  // Day 3: some illegal vessels present paperwork with nothing wrong on it, before any tool can check it.
  const clean = FALSIFIED_REPORTS.cleanPaperwork
  if (!legal && !requireLie && day === clean.day && rand() < clean.chance) {
    for (let i = 0; i < MAX_TRIES; i++) {
      const lie = falsify(rand, actual, TOOLS, regulations, ctx)
      if (lie) return { ...lie.shown, actual, lies: lie.lies, priorViolations: priorViolations(rand, true, false) }
      actual = randomActual(rand, opts, false)
    }
  }
  const allowed = requireLie ? [requireLie] : TOOLS.filter((t) => day >= FALSIFIED_REPORTS.lieFromDay[t])

  if (!legal && allowed.length > 0 && (requireLie || rand() < FALSIFIED_REPORTS.chance(day))) {
    const lie = falsify(rand, actual, allowed, regulations, ctx)
    if (lie) return { ...lie.shown, actual, lies: lie.lies, priorViolations: priorViolations(rand, true, false) }
  }

  if (legal && allowed.length > 0 && rand() < FALSIFIED_REPORTS.innocentDiscrepancy) {
    return { ...actual, actual: innocentDiscrepancy(rand, actual, allowed), lies: [], priorViolations: priorViolations(rand, false, true) }
  }

  return { ...actual, actual, lies: [], priorViolations: priorViolations(rand, false, legal) }
}

/**
 * Build a ship from the content pools, aiming for `legalChance` of ships whose actual activity passes
 * every rule in force today. From Day 4, some illegal ships falsify their report to look legal.
 */
export function generateShip(rand: Rng, opts: GenerateOptions): Ship {
  let ship = buildShip(rand, opts)
  for (let i = 1; opts.requireLie && i < MAX_TRIES && !ship.lies.includes(opts.requireLie); i++) {
    ship = buildShip(rand, opts)
  }
  return applyBlacklist(rand, ship, opts)
}

const withName = (docs: Documents, vesselName: string): Documents => ({
  report: { ...docs.report, vesselName },
  license: { ...docs.license, vesselName },
})

/**
 * Give an illegal ship a blacklisted name (BLACKLIST.chance of the time), and make sure no other ship
 * shares a name with the blacklist. The guided example is never blacklisted, so it still teaches tracking.
 */
function applyBlacklist(rand: Rng, ship: Ship, opts: GenerateOptions): Ship {
  const blacklist = opts.blacklist ?? []
  if (blacklist.length === 0) return ship
  const illegal = findViolations(ship.actual, opts.regulations, opts.ctx).length > 0
  let name = ship.report.vesselName
  if (illegal && !opts.requireLie && rand() < BLACKLIST.chance) name = pick(rand, blacklist)
  else while (blacklist.includes(name)) name = generateVesselName(rand)
  if (name === ship.report.vesselName) return ship
  return { ...ship, ...withName(ship, name), actual: withName(ship.actual, name) }
}
