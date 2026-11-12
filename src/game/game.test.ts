import { describe, expect, it } from 'vitest'
import { addMonths, compareDates, dateOfDay, formatDate } from './date'
import { generateShip } from './generateShip'
import { mulberry32 } from './random'
import { findViolations, regulationsForDay } from './regulations'
import { FISHING_REGIONS, SPECIES, SPECIES_NAMES } from '../data/pools'
import { DAY_REGULATIONS, RULES } from '../data/regulations'
import { START_DATE, TOTAL_DAYS } from '../data/start'
import type { CatchEntry, FishingLicense, FishingReport, InspectionContext, Regulation, Ship } from './types'

// ---- helpers ----

const fish = (species: string, sizeIn = 30, gear = 'Hook and Line'): CatchEntry => ({
  species,
  amount: 10,
  unit: 'fish',
  sizeIn,
  gear,
})

function makeShip(report: Partial<FishingReport> = {}, license: Partial<FishingLicense> = {}): Ship {
  return {
    report: {
      arrivalNo: 1,
      vesselName: 'The Quiet Gull',
      fishingRegion: 'San Diego Bay',
      catches: [fish('Yellowtail')],
      bait: null,
      ...report,
    },
    license: {
      vesselName: 'The Quiet Gull',
      licenseNumber: 'L-000001',
      expires: { year: 1990, month: 1, day: 1 },
      permits: [],
      ...license,
    },
  }
}

/** Context on the 1st (or given day) of a month in 2026. */
const on = (month: number, day = 1, biodiversity = 100): InspectionContext => ({
  date: { year: 2026, month, day },
  biodiversity,
})

const passes = (rule: Regulation, catches: CatchEntry[], ctx = on(7), extra: Partial<FishingReport> = {}, license: Partial<FishingLicense> = {}) =>
  rule.findIssue(makeShip({ catches, ...extra }, license), ctx) === null

const issueFor = (rule: Regulation, catches: CatchEntry[], ctx = on(7), extra: Partial<FishingReport> = {}) =>
  rule.findIssue(makeShip({ catches, ...extra }), ctx)

// ---- dates ----

describe('dates', () => {
  it('formats document dates', () => {
    expect(formatDate({ year: 2026, month: 1, day: 1 })).toBe('01 JAN 2026')
  })

  it('runs January through December 2026, each day the first of the month', () => {
    expect(dateOfDay(START_DATE, 1)).toEqual({ year: 2026, month: 1, day: 1 })
    expect(dateOfDay(START_DATE, 6)).toEqual({ year: 2026, month: 6, day: 1 })
    expect(dateOfDay(START_DATE, 12)).toEqual({ year: 2026, month: 12, day: 1 })
  })

  it('adds months across years', () => {
    expect(addMonths({ year: 2026, month: 11, day: 15 }, 3)).toEqual({ year: 2027, month: 2, day: 15 })
    expect(addMonths({ year: 2026, month: 1, day: 15 }, -1)).toEqual({ year: 2025, month: 12, day: 15 })
  })
})

// ---- regulations ----

describe('regulations', () => {
  it('only reference species that exist in the pool', () => {
    expect(SPECIES.map((s) => s.name).sort()).toEqual(Object.values(SPECIES_NAMES).sort())
  })

  it('requires San Diego waters', () => {
    const yellowtail = [fish('Yellowtail')]
    expect(passes(RULES.sanDiegoWaters, yellowtail, on(7), { fishingRegion: 'Point Loma Kelp Beds' })).toBe(true)
    expect(passes(RULES.sanDiegoWaters, yellowtail, on(7), { fishingRegion: 'Baja California' })).toBe(false)
  })

  it('bans off-limits species', () => {
    for (const s of ['Giant Sea Bass', 'Red Abalone', 'White Shark']) {
      expect(passes(RULES.offLimits, [fish('Yellowtail'), fish(s)])).toBe(false)
    }
    expect(passes(RULES.offLimits, [fish('Blue Shark')])).toBe(true)
  })

  it('closes ocean salmon October–April and requires 27 in', () => {
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(5))).toBe(true)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 26)], on(5))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(4))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(10))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(1))).toBe(false)
  })

  it('closes sheephead January–February and requires 13 in', () => {
    expect(passes(RULES.sheephead, [fish('California Sheephead', 14)], on(3))).toBe(true)
    expect(passes(RULES.sheephead, [fish('California Sheephead', 12)], on(3))).toBe(false)
    expect(passes(RULES.sheephead, [fish('California Sheephead', 14)], on(2))).toBe(false)
  })

  it('closes white seabass March 15 – June 15', () => {
    const seabass = [fish('White Seabass')]
    expect(passes(RULES.whiteSeabass, seabass, on(3, 14))).toBe(true)
    expect(passes(RULES.whiteSeabass, seabass, on(3, 15))).toBe(false)
    expect(passes(RULES.whiteSeabass, seabass, on(6, 1))).toBe(false)
    expect(passes(RULES.whiteSeabass, seabass, on(6, 15))).toBe(false)
    expect(passes(RULES.whiteSeabass, seabass, on(6, 16))).toBe(true)
  })

  it('requires an HMS permit for skipjack tuna and blue shark', () => {
    expect(passes(RULES.hmsPermit, [fish('Skipjack Tuna')])).toBe(false)
    expect(passes(RULES.hmsPermit, [fish('Blue Shark')], on(7), {}, { permits: ['HMS'] })).toBe(true)
    expect(passes(RULES.hmsPermit, [fish('Yellowtail')])).toBe(true)
  })

  it('requires 28 in yellowtail', () => {
    expect(passes(RULES.yellowtailSize, [fish('Yellowtail', 28)])).toBe(true)
    expect(passes(RULES.yellowtailSize, [fish('Yellowtail', 27)])).toBe(false)
  })

  it('requires a net permit for gill and trammel nets', () => {
    const netted = [fish('White Seabass', 30, 'Gill Net')]
    expect(passes(RULES.netPermit, netted)).toBe(false)
    expect(passes(RULES.netPermit, netted, on(7), {}, { permits: ['General Gill/Trammel Net'] })).toBe(true)
    expect(passes(RULES.netPermit, [fish('Yellowtail', 30, 'Purse Seine')])).toBe(true)
  })

  it('forbids netting certain species even with a permit', () => {
    const permit = { permits: ['General Gill/Trammel Net' as const] }
    expect(passes(RULES.noNetSpecies, [fish('California Sheephead', 14, 'Trammel Net')], on(7), {}, permit)).toBe(false)
    expect(passes(RULES.noNetSpecies, [fish('White Seabass', 30, 'Gill Net')], on(7), {}, permit)).toBe(true)
  })

  it('requires rod and reel and 36 in for leopard shark', () => {
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 40, 'Rod and Reel')])).toBe(true)
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 30, 'Rod and Reel')])).toBe(false)
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 40, 'Longline')])).toBe(false)
  })

  it('bans tilapia bait', () => {
    expect(passes(RULES.tilapiaBait, [fish('Yellowtail')], on(7), { bait: 'Tilapia' })).toBe(false)
    expect(passes(RULES.tilapiaBait, [fish('Yellowtail')], on(7), { bait: 'Squid' })).toBe(true)
  })

  it('closes coastal pelagics when marine biodiversity is 30% or lower', () => {
    const sardines = [fish('Pacific Sardine', 6, 'Purse Seine')]
    expect(passes(RULES.coastalPelagics, sardines, on(7, 1, 31))).toBe(true)
    expect(passes(RULES.coastalPelagics, sardines, on(7, 1, 30))).toBe(false)
  })
})

describe('issue explanations', () => {
  it('name the region outside San Diego waters', () => {
    expect(issueFor(RULES.sanDiegoWaters, [fish('Yellowtail')], on(7), { fishingRegion: 'Baja California' })).toBe(
      'Fished in Baja California, which is outside San Diego waters.',
    )
  })

  it('list every protected species caught', () => {
    expect(issueFor(RULES.offLimits, [fish('White Shark'), fish('Red Abalone')])).toBe(
      'Caught white shark and red abalone, which are off limits.',
    )
  })

  it('distinguish a closed season from an undersized fish', () => {
    expect(issueFor(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(1))).toMatch(/season is closed/)
    expect(issueFor(RULES.oceanSalmon, [fish('Ocean Salmon', 22)], on(6))).toBe(
      'Ocean Salmon as small as 22 in; the minimum is 27 in.',
    )
  })

  it('report the smallest offending size', () => {
    expect(issueFor(RULES.yellowtailSize, [fish('Yellowtail', 24)])).toBe(
      'Yellowtail as small as 24 in; the minimum is 28 in.',
    )
  })

  it('are null when the ship complies', () => {
    for (const rule of Object.values(RULES) as Regulation[]) {
      expect(rule.findIssue(makeShip(), on(7))).toBeNull()
    }
  })
})

describe('rollout', () => {
  it('starts day 1 with San Diego waters and protected species', () => {
    expect(regulationsForDay(1).map((r) => r.id)).toEqual(['san-diego-waters', 'off-limits'])
  })

  it('never drops a rule and uses every rule by the last day', () => {
    for (let day = 2; day <= TOTAL_DAYS; day++) {
      const prev = DAY_REGULATIONS[day - 1].map((r) => r.id)
      expect(DAY_REGULATIONS[day].map((r) => r.id)).toEqual(expect.arrayContaining(prev))
    }
    expect(DAY_REGULATIONS[TOTAL_DAYS]).toHaveLength(Object.keys(RULES).length)
  })
})

// ---- generation ----

describe('generateShip', () => {
  for (const day of [1, 6, 12]) {
    const date = dateOfDay(START_DATE, day)
    const ctx = { date, biodiversity: 100 }
    const regulations = regulationsForDay(day)
    const ships = Array.from({ length: 200 }, (_, i) =>
      generateShip(mulberry32(i), { arrivalNo: i + 1, regulations, ctx }),
    )

    it(`follows the report and license parameters (day ${day})`, () => {
      for (const { report, license } of ships) {
        expect(report.vesselName).toMatch(/^The \w+ \w+$/)
        expect(FISHING_REGIONS.map((r) => r.name)).toContain(report.fishingRegion)
        expect(report.catches.length).toBeGreaterThanOrEqual(1)
        expect(report.catches.length).toBeLessThanOrEqual(3)
        expect(new Set(report.catches.map((c) => c.species)).size).toBe(report.catches.length)
        for (const c of report.catches) {
          const def = SPECIES.find((s) => s.name === c.species)!
          expect(c.sizeIn).toBeGreaterThanOrEqual(def.sizeIn[0])
          expect(c.sizeIn).toBeLessThanOrEqual(def.sizeIn[1])
          expect(def.gear).toContain(c.gear)
        }
        expect(license.vesselName).toBe(report.vesselName)
        expect(license.licenseNumber).toMatch(/^L-\d{6}$/)
        expect(compareDates(license.expires, date)).toBeGreaterThan(0)
      }
    })

    it(`mixes legal and illegal ships roughly evenly (day ${day})`, () => {
      const legal = ships.filter((s) => findViolations(s, regulations, ctx).length === 0).length
      expect(legal).toBeGreaterThan(60)
      expect(legal).toBeLessThan(140)
    })
  }

  it('is deterministic for a seed', () => {
    const opts = { arrivalNo: 1, regulations: regulationsForDay(1), ctx: { date: START_DATE, biodiversity: 100 } }
    expect(generateShip(mulberry32(42), opts)).toEqual(generateShip(mulberry32(42), opts))
  })
})
