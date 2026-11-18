import type { ShopItem, Tool } from '../game/types'

/*
 * The port's operating budget, verification costs, shop prices and falsified-report rollout.
 * All values are first guesses to be balanced in playtesting.
 */

export const ECONOMY = {
  startMoney: 200,
  /** Port fees earned for every vessel accepted, legal or not. */
  acceptRevenue: 30,
  /** Industry complaint charged for rejecting a legal vessel. */
  wrongRejectFine: 20,
  /** Paid at the end of each day. If the port can't cover it, the port is shut down. */
  operatingExpense: 100,
  /** Inspections per day that cost nothing. */
  freeInspections: 3,
  /** Free inspections per day with an Additional Inspector. */
  inspectorFreeInspections: 5,
  /** Cost of each inspection past the free ones. */
  inspectionCost: 10,
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
    price: () => 150,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'license',
    name: 'License Database',
    description: 'Look up the license number: see which permits are really on file.',
    price: () => 200,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'inspector',
    name: 'Additional Inspector',
    description: `Free inspections per day go from ${ECONOMY.freeInspections} to ${ECONOMY.inspectorFreeInspections}.`,
    price: () => 100,
    max: 1,
    fromDay: 4,
  },
  {
    id: 'habitat',
    name: 'Habitat Restoration',
    description: `Restores +${HABITAT_RECOVERY_PER_LEVEL}% Marine Biodiversity at the start of every later day. Stacks.`,
    price: (owned) => 100 + 50 * owned,
    max: 5,
    fromDay: 1,
  },
]

export const FALSIFIED_REPORTS = {
  /** Day the Port Authority bulletin announces falsified reports and issues Vessel Tracking. */
  startDay: 4,
  /** Chance that an illegal vessel falsifies its paperwork to look legal, by day. */
  chance: (day: number) => (day < 4 ? 0 : Math.min(0.6, 0.3 + 0.05 * (day - 4))),
  /** First day each kind of lie appears, so lies come in about when the tool to catch them can be bought. */
  lieFromDay: { tracking: 4, catch: 5, license: 7 } satisfies Record<Tool, number>,
  /**
   * Chance a legal vessel's report has a harmless discrepancy (e.g. a different San Diego fishing ground),
   * so a mismatch alone doesn't prove a vessel is illegal.
   */
  innocentDiscrepancy: 0.2,
}

export const TOOL_NAMES: Record<Tool, string> = {
  tracking: 'Vessel Tracking',
  catch: 'Catch Verification',
  license: 'License Database',
}
