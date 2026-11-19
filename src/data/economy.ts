import type { ShopItem, Tool } from '../game/types'

/*
 * The port's operating budget, verification costs, shop prices and falsified-report rollout.
 * Tuned with the balance simulation (npm run sim, scripts/balance.sim.test.ts) for 2-minute days.
 */

export const ECONOMY = {
  startMoney: 75,
  /** Port fees earned for every vessel accepted, legal or not. */
  acceptRevenue: 15,
  /** Industry complaint charged for rejecting a legal vessel. */
  wrongRejectFine: 8,
  /** Paid at the end of each day. If the port can't cover it, the port is shut down. */
  operatingExpense: 30,
  /** Inspections per day that cost nothing. */
  freeInspections: 3,
  /** Free inspections per day with an Additional Inspector. */
  inspectorFreeInspections: 5,
  /** Cost of each inspection past the free ones. */
  inspectionCost: 8,
}

/** Percentage points of biodiversity each Habitat Restoration purchase restores at the start of every later day. */
export const HABITAT_RECOVERY_PER_LEVEL = 2

export interface ShopItemDef {
  id: ShopItem
  name: string
  description: string
  /** Price given how many times it has already been bought. */
  price: (owned: number) => number
  /** Most times it can be bought. */
  max: number
  /** First day whose end-of-day shop offers it. */
  fromDay: number
}

export const SHOP: ShopItemDef[] = [
  {
    id: 'catch',
    name: 'Catch Verification',
    description: 'Inspect the hold: compare reported catches, sizes and bait with what is on board.',
    price: () => 55,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'license',
    name: 'License Database',
    description: 'Look up the license number: see which permits are really on file.',
    price: () => 75,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'inspector',
    name: 'Additional Inspector',
    description: `Free inspections per day go from ${ECONOMY.freeInspections} to ${ECONOMY.inspectorFreeInspections}.`,
    price: () => 40,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'habitat',
    name: 'Habitat Restoration',
    description: `Restores +${HABITAT_RECOVERY_PER_LEVEL}% Marine Biodiversity at the start of every later day. Stacks.`,
    price: (owned) => 40 + 20 * owned,
    max: 5,
    fromDay: 1,
  },
]

export const FALSIFIED_REPORTS = {
  /** Day the Port Authority bulletin announces falsified reports and issues Vessel Tracking. */
  startDay: 4,
  /**
   * Day 3, before any verification tool exists: this share of illegal vessels hand over paperwork that passes
   * every rule. Only the blacklist can catch them.
   */
  cleanPaperwork: { day: 3, chance: 0.4 },
  /** Chance that an illegal vessel falsifies its paperwork to look legal, by day (from Day 4). */
  chance: (day: number) => (day < 4 ? 0 : Math.min(0.6, 0.3 + 0.05 * (day - 4))),
  /** First day each kind of lie appears, so lies come in about when the tool to catch them can be bought. */
  lieFromDay: { tracking: 4, catch: 5, license: 7 } satisfies Record<Tool, number>,
  /**
   * Chance a legal vessel's report has a harmless discrepancy (e.g. a different San Diego fishing ground),
   * so a mismatch alone doesn't prove a vessel is illegal.
   */
  innocentDiscrepancy: 0.2,
}

/**
 * From Day 2 (the Matching documents and License stamp rules), some illegal vessels arrive with a flawed
 * license: made out to a different vessel, missing its stamp, or carrying a forged stamp. Nothing is hidden:
 * the flaw is right there on the paperwork. Each kind is equally likely.
 */
export const LICENSE_DISCREPANCY = {
  /** Chance per illegal vessel that isn't already falsifying its paperwork. */
  chance: 0.25,
}

/** From Day 3, the port posts a daily blacklist of known offenders. */
export const BLACKLIST = {
  fromDay: 3,
  /** Names on each day's list. */
  size: [5, 10] as [number, number],
  /** Chance an illegal vessel is on the list, whether or not its paperwork looks legal. Legal vessels never are. */
  chance: 1 / 3,
}

export const TOOL_NAMES: Record<Tool, string> = {
  tracking: 'Vessel Tracking',
  catch: 'Catch Verification',
  license: 'License Database',
}
