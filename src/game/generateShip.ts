import type { CatchEntry, InspectionContext, Permit, Regulation, Ship } from './types'
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

interface GenerateOptions {
  arrivalNo: number
  /** The day's regulations and inspection context, used to balance legal vs. illegal ships. */
  regulations: Regulation[]
  ctx: InspectionContext
  /** Chance the ship should comply with every rule. Defaults to 0.5. */
  legalChance?: number
}

/** Resampling cap; if no ship of the wanted kind turns up, the last one is used. */
const MAX_TRIES = 100

export function generateVesselName(rand: Rng): string {
  return `The ${pick(rand, VESSEL_ADJECTIVES)} ${pick(rand, VESSEL_NOUNS)}`
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

/** One fully random ship. Its license always matches the report and is valid on arrival. */
export function randomShip(rand: Rng, arrivalNo: number, ctx: InspectionContext): Ship {
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

/**
 * Build a ship from the content pools, aiming for `legalChance` of ships that pass
 * every rule in force today and the rest breaking at least one.
 */
export function generateShip(
  rand: Rng,
  { arrivalNo, regulations, ctx, legalChance = 0.5 }: GenerateOptions,
): Ship {
  const wantLegal = rand() < legalChance
  let ship = randomShip(rand, arrivalNo, ctx)
  for (let i = 1; i < MAX_TRIES; i++) {
    if ((findViolations(ship, regulations, ctx).length === 0) === wantLegal) break
    ship = randomShip(rand, arrivalNo, ctx)
  }
  return ship
}
