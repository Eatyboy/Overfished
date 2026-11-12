import type { AmountUnit, Permit } from '../game/types'

/*
 * Pools that fishing reports and licenses are randomly generated from.
 * Species list is from the team's commercial-fishing research.
 * Size, amount and gear ranges are placeholders chosen so the size and gear rules sometimes trip.
 */

/** Vessel names follow the pattern "The <Adjective> <Noun>". */
export const VESSEL_ADJECTIVES = [
  'Silver', 'Salty', 'Lucky', 'Restless', 'Northern',
  'Golden', 'Crimson', 'Quiet', 'Wandering', 'Iron',
] as const

export const VESSEL_NOUNS = [
  'Petrel', 'Albatross', 'Marlin', 'Tide', 'Gull',
  'Pelican', 'Current', 'Mariner', 'Heron', 'Anchor',
] as const

export interface RegionDef {
  name: string
  /** Counts as "San Diego waters". */
  sanDiego: boolean
}

/** Placeholder regions. */
export const FISHING_REGIONS: RegionDef[] = [
  { name: 'San Diego Bay', sanDiego: true },
  { name: 'Point Loma Kelp Beds', sanDiego: true },
  { name: 'La Jolla Canyon', sanDiego: true },
  { name: 'Channel Islands', sanDiego: false },
  { name: 'Baja California', sanDiego: false },
  { name: 'High Seas', sanDiego: false },
]

// ---- gear ----

export const ROD_AND_REEL = 'Rod and Reel'
export const GILL_NET = 'Gill Net'
export const TRAMMEL_NET = 'Trammel Net'
/** Gear that requires the General Gill/Trammel Net permit. */
export const GILL_TRAMMEL_NETS: readonly string[] = [GILL_NET, TRAMMEL_NET]

// ---- species ----

export const SPECIES_NAMES = {
  giantSeaBass: 'Giant Sea Bass',
  redAbalone: 'Red Abalone',
  whiteShark: 'White Shark',
  skipjackTuna: 'Skipjack Tuna',
  blueShark: 'Blue Shark',
  yellowtail: 'Yellowtail',
  leopardShark: 'Leopard Shark',
  whiteSeabass: 'White Seabass',
  oceanSalmon: 'Ocean Salmon',
  sheephead: 'California Sheephead',
  anchovy: 'Anchovy',
  sardine: 'Pacific Sardine',
  jackMackerel: 'Jack Mackerel',
  pacificMackerel: 'Pacific Mackerel',
} as const

const S = SPECIES_NAMES

/** Coastal pelagics / baitfish: tracked by weight, not count. */
export const COASTAL_PELAGICS: readonly string[] = [S.anchovy, S.sardine, S.jackMackerel, S.pacificMackerel]

export interface SpeciesDef {
  name: string
  /** Smallest-fish size range, in inches. */
  sizeIn: [number, number]
  amount: [number, number]
  unit: AmountUnit
  /** Gear this species might plausibly be reported with. */
  gear: string[]
}

export const SPECIES: SpeciesDef[] = [
  { name: S.giantSeaBass, sizeIn: [30, 80], amount: [1, 6], unit: 'fish', gear: ['Hook and Line', GILL_NET] },
  { name: S.redAbalone, sizeIn: [5, 10], amount: [5, 40], unit: 'fish', gear: ['Diving'] },
  { name: S.whiteShark, sizeIn: [60, 200], amount: [1, 3], unit: 'fish', gear: ['Longline', GILL_NET, 'Harpoon'] },
  { name: S.skipjackTuna, sizeIn: [16, 36], amount: [20, 200], unit: 'fish', gear: ['Hook and Line', 'Purse Seine', GILL_NET] },
  { name: S.blueShark, sizeIn: [40, 120], amount: [1, 12], unit: 'fish', gear: ['Longline', 'Harpoon', GILL_NET] },
  { name: S.yellowtail, sizeIn: [20, 40], amount: [10, 120], unit: 'fish', gear: ['Hook and Line', ROD_AND_REEL, 'Purse Seine'] },
  { name: S.leopardShark, sizeIn: [24, 60], amount: [1, 15], unit: 'fish', gear: [ROD_AND_REEL, 'Longline', GILL_NET] },
  { name: S.whiteSeabass, sizeIn: [24, 50], amount: [5, 80], unit: 'fish', gear: ['Hook and Line', GILL_NET] },
  { name: S.oceanSalmon, sizeIn: [18, 40], amount: [10, 100], unit: 'fish', gear: ['Hook and Line', ROD_AND_REEL, GILL_NET] },
  { name: S.sheephead, sizeIn: [8, 24], amount: [5, 60], unit: 'fish', gear: ['Trap', 'Hook and Line', TRAMMEL_NET] },
  { name: S.anchovy, sizeIn: [3, 8], amount: [500, 8000], unit: 'lb', gear: ['Purse Seine', GILL_NET] },
  { name: S.sardine, sizeIn: [5, 10], amount: [500, 8000], unit: 'lb', gear: ['Purse Seine', GILL_NET] },
  { name: S.jackMackerel, sizeIn: [8, 20], amount: [500, 6000], unit: 'lb', gear: ['Purse Seine', GILL_NET] },
  { name: S.pacificMackerel, sizeIn: [8, 18], amount: [500, 6000], unit: 'lb', gear: ['Purse Seine', GILL_NET] },
]

/** Bait a ship may carry. Tilapia is illegal as bait. */
export const BAIT = ['Squid', 'Anchovy', 'Sardine', 'Tilapia'] as const

export const PERMITS: readonly Permit[] = ['HMS', 'General Gill/Trammel Net']
