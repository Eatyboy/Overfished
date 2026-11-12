import type { CatchEntry, GameDate, Regulation, Ship } from '../game/types'
import {
  COASTAL_PELAGICS,
  FISHING_REGIONS,
  GILL_TRAMMEL_NETS,
  ROD_AND_REEL,
  SPECIES_NAMES as S,
} from './pools'

/** Marine Biodiversity at or below this closes coastal pelagic fishing. */
export const PELAGIC_CLOSURE_THRESHOLD = 30

const SAN_DIEGO_REGIONS = FISHING_REGIONS.filter((r) => r.sanDiego).map((r) => r.name)
const OFF_LIMITS: readonly string[] = [S.giantSeaBass, S.redAbalone, S.whiteShark]
const HMS_SPECIES: readonly string[] = [S.skipjackTuna, S.blueShark]
const NO_NET_SPECIES: readonly string[] = [S.oceanSalmon, S.leopardShark, S.sheephead, S.skipjackTuna, S.blueShark]

const catchesOf = (ship: Ship, species: string): CatchEntry[] =>
  ship.report.catches.filter((c) => c.species === species)

/** True if `date` falls in a [month, day] window, inclusive. Windows may wrap past December. */
function inWindow(date: GameDate, from: [number, number], to: [number, number]): boolean {
  const x = date.month * 100 + date.day
  const a = from[0] * 100 + from[1]
  const b = to[0] * 100 + to[1]
  return a <= b ? x >= a && x <= b : x >= a || x <= b
}

/** "a", "a and b", "a, b and c" */
const list = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

const lower = (species: string) => species.toLowerCase()

/** Size and season issues shared by the seasonal species rules. */
function seasonalIssue(
  ship: Ship,
  date: GameDate,
  species: string,
  closed: [[number, number], [number, number]],
  closedText: string,
  minIn: number,
): string | null {
  const caught = catchesOf(ship, species)
  if (caught.length === 0) return null
  if (inWindow(date, ...closed)) return `${species} season is closed ${closedText}, but the report lists ${lower(species)}.`
  const small = caught.find((c) => c.sizeIn < minIn)
  return small ? `${species} as small as ${small.sizeIn} in; the minimum is ${minIn} in.` : null
}

/** Every regulation in the game, by id. Which ones are in force is set by DAY_REGULATIONS. */
export const RULES = {
  sanDiegoWaters: {
    id: 'san-diego-waters',
    title: 'San Diego waters only',
    description: `Must have fished in San Diego waters: ${SAN_DIEGO_REGIONS.join(', ')}.`,
    findIssue: ({ report }) =>
      SAN_DIEGO_REGIONS.includes(report.fishingRegion)
        ? null
        : `Fished in ${report.fishingRegion}, which is outside San Diego waters.`,
  },
  offLimits: {
    id: 'off-limits',
    title: 'Protected species',
    description: 'Giant sea bass, red abalone and white shark are off limits.',
    findIssue: ({ report }) => {
      const found = report.catches.filter((c) => OFF_LIMITS.includes(c.species)).map((c) => lower(c.species))
      return found.length ? `Caught ${list(found)}, which ${found.length > 1 ? 'are' : 'is'} off limits.` : null
    },
  },
  oceanSalmon: {
    id: 'ocean-salmon',
    title: 'Ocean salmon',
    description: 'Closed October–April. Minimum 27 in when open.',
    findIssue: (ship, { date }) =>
      seasonalIssue(ship, date, S.oceanSalmon, [[10, 1], [4, 30]], 'October–April', 27),
  },
  sheephead: {
    id: 'sheephead',
    title: 'California sheephead',
    description: 'Closed January–February. Minimum 13 in when open.',
    findIssue: (ship, { date }) =>
      seasonalIssue(ship, date, S.sheephead, [[1, 1], [2, 31]], 'January–February', 13),
  },
  hmsPermit: {
    id: 'hms-permit',
    title: 'HMS permit',
    description: 'Skipjack tuna and blue shark require an HMS permit.',
    findIssue: ({ report, license }) => {
      if (license.permits.includes('HMS')) return null
      const found = report.catches.filter((c) => HMS_SPECIES.includes(c.species)).map((c) => lower(c.species))
      return found.length ? `Caught ${list(found)}, but the license has no HMS permit.` : null
    },
  },
  yellowtailSize: {
    id: 'yellowtail-size',
    title: 'Yellowtail size',
    description: 'Minimum 28 in. No allowance for smaller fish.',
    findIssue: (ship) => {
      const small = catchesOf(ship, S.yellowtail).find((c) => c.sizeIn < 28)
      return small ? `Yellowtail as small as ${small.sizeIn} in; the minimum is 28 in.` : null
    },
  },
  whiteSeabass: {
    id: 'white-seabass',
    title: 'White seabass season',
    description: 'Closed March 15 – June 15.',
    findIssue: (ship, { date }) =>
      catchesOf(ship, S.whiteSeabass).length > 0 && inWindow(date, [3, 15], [6, 15])
        ? 'White seabass season is closed March 15 – June 15, but the report lists white seabass.'
        : null,
  },
  netPermit: {
    id: 'net-permit',
    title: 'Gill & trammel nets',
    description: 'Gill or trammel nets require a General Gill/Trammel Net permit.',
    findIssue: ({ report, license }) => {
      if (license.permits.includes('General Gill/Trammel Net')) return null
      const net = report.catches.find((c) => GILL_TRAMMEL_NETS.includes(c.gear))
      return net ? `Used a ${lower(net.gear)}, but the license has no General Gill/Trammel Net permit.` : null
    },
  },
  noNetSpecies: {
    id: 'no-net-species',
    title: 'No-net species',
    description: 'Ocean salmon, leopard shark, sheephead, skipjack tuna and blue shark may not be netted.',
    findIssue: ({ report }) => {
      const c = report.catches.find((c) => NO_NET_SPECIES.includes(c.species) && GILL_TRAMMEL_NETS.includes(c.gear))
      return c ? `${c.species} was caught with a ${lower(c.gear)}, and it may not be netted.` : null
    },
  },
  leopardShark: {
    id: 'leopard-shark',
    title: 'Leopard shark',
    description: 'Rod and reel only. Minimum 36 in.',
    findIssue: (ship) => {
      const caught = catchesOf(ship, S.leopardShark)
      const wrongGear = caught.find((c) => c.gear !== ROD_AND_REEL)
      if (wrongGear) return `Leopard shark was caught with ${lower(wrongGear.gear)}; only rod and reel is allowed.`
      const small = caught.find((c) => c.sizeIn < 36)
      return small ? `Leopard shark as small as ${small.sizeIn} in; the minimum is 36 in.` : null
    },
  },
  tilapiaBait: {
    id: 'tilapia-bait',
    title: 'Bait',
    description: 'Tilapia may not be used or possessed as bait.',
    findIssue: ({ report }) => (report.bait === 'Tilapia' ? 'Carrying tilapia as bait.' : null),
  },
  coastalPelagics: {
    id: 'coastal-pelagics',
    title: 'Coastal pelagics',
    description: `Anchovy, sardine, jack & Pacific mackerel are closed while Marine Biodiversity is ${PELAGIC_CLOSURE_THRESHOLD}% or lower.`,
    findIssue: ({ report }, { biodiversity }) => {
      if (biodiversity > PELAGIC_CLOSURE_THRESHOLD) return null
      const found = report.catches.filter((c) => COASTAL_PELAGICS.includes(c.species)).map((c) => lower(c.species))
      return found.length
        ? `Caught ${list(found)} while Marine Biodiversity is ${PELAGIC_CLOSURE_THRESHOLD}% or lower.`
        : null
    },
  },
} satisfies Record<string, Regulation>

const R = RULES

/** Rules that apply every day. */
export const STATIC_REGULATIONS: Regulation[] = []

/*
 * Rules in force each day (1–12). Each entry is that day's full set, so a rule can be dropped later.
 * Default rollout: one or two new rules a day. Seasonal rules come in while their closures still
 * have something to bite on (Day N = month N of 2026; sheephead closed day 2, salmon days 3–4
 * and 10–12, white seabass days 4–6).
 */
const ROLLOUT: Regulation[][] = [
  [R.sanDiegoWaters, R.offLimits], // 1  Jan
  [R.sheephead], //                   2  Feb
  [R.oceanSalmon], //                 3  Mar
  [R.whiteSeabass], //                4  Apr
  [R.hmsPermit], //                   5  May
  [R.yellowtailSize], //              6  Jun
  [R.netPermit, R.noNetSpecies], //   7  Jul
  [R.leopardShark], //                8  Aug
  [R.tilapiaBait], //                 9  Sep
  [R.coastalPelagics], //             10 Oct
  [], //                              11 Nov
  [], //                              12 Dec
]

export const DAY_REGULATIONS: Record<number, Regulation[]> = Object.fromEntries(
  ROLLOUT.map((_, i) => [i + 1, ROLLOUT.slice(0, i + 1).flat()]),
)
