import { describe, expect, it } from 'vitest'
import { addMonths, compareDates, dateOfDay, formatDate } from './date'
import { FORGED_STAMPS, generateBlacklist, generateShip, misnamed } from './generateShip'
import { mulberry32 } from './random'
import { findViolations, regulationsForDay } from './regulations'
import { FISHING_REGIONS, SPECIES, SPECIES_NAMES } from '../data/pools'
import { DAY_REGULATIONS, RULES } from '../data/regulations'
import { START_DATE, TOTAL_DAYS } from '../data/start'
import { BLACKLIST, FALSIFIED_REPORTS, LICENSE_DISCREPANCY } from '../data/economy'
import type { CatchEntry, Documents, FishingLicense, FishingReport, InspectionContext, Regulation, Ship } from './types'

// ---- helpers ----

const fish = (species: string, sizeIn = 30, gear = 'Hook and Line'): CatchEntry => ({
  species,
  amount: 10,
  unit: 'fish',
  sizeIn,
  gear,
})

function makeShip(report: Partial<FishingReport> = {}, license: Partial<FishingLicense> = {}): Documents {
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
      stamp: 'official',
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

  it('opens ocean salmon May–September and requires 27 in', () => {
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(5))).toBe(true)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 26)], on(5))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(4))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(10))).toBe(false)
    expect(passes(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(1))).toBe(false)
  })

  it('opens sheepshead March–December and requires 13 in', () => {
    expect(passes(RULES.sheepshead, [fish('California Sheepshead', 14)], on(3))).toBe(true)
    expect(passes(RULES.sheepshead, [fish('California Sheepshead', 12)], on(3))).toBe(false)
    expect(passes(RULES.sheepshead, [fish('California Sheepshead', 14)], on(2))).toBe(false)
  })

  it('opens white seabass June 16 – March 14', () => {
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
    expect(passes(RULES.noNetSpecies, [fish('California Sheepshead', 14, 'Trammel Net')], on(7), {}, permit)).toBe(false)
    expect(passes(RULES.noNetSpecies, [fish('White Seabass', 30, 'Gill Net')], on(7), {}, permit)).toBe(true)
  })

  it('requires rod and reel and 36 in for leopard shark', () => {
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 40, 'Rod and Reel')])).toBe(true)
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 30, 'Rod and Reel')])).toBe(false)
    expect(passes(RULES.leopardShark, [fish('Leopard Shark', 40, 'Longline')])).toBe(false)
  })

  it('requires the report and license to name the same vessel', () => {
    expect(passes(RULES.matchingDocuments, [fish('Yellowtail')])).toBe(true)
    expect(passes(RULES.matchingDocuments, [fish('Yellowtail')], on(7), {}, { vesselName: 'The Quiet Gulf' })).toBe(false)
    const rule: Regulation = RULES.matchingDocuments
    expect(rule.findIssue(makeShip({}, { vesselName: 'The Quiet Tide' }), on(7))).toBe(
      'The report is for The Quiet Gull, but the license is for The Quiet Tide.',
    )
  })

  it('requires the official stamp on the license', () => {
    const rule: Regulation = RULES.licenseStamp
    expect(rule.findIssue(makeShip(), on(7))).toBeNull()
    expect(rule.findIssue(makeShip({}, { stamp: null }), on(7))).toBe('The license has no Port Authority stamp.')
    for (const stamp of FORGED_STAMPS) {
      expect(rule.findIssue(makeShip({}, { stamp }), on(7))).toBe('The stamp on the license is not the official Port Authority stamp.')
    }
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
    expect(issueFor(RULES.oceanSalmon, [fish('Ocean Salmon', 30)], on(1))).toBe(
      'Ocean Salmon fishing season is May – September, but the catch includes ocean salmon.',
    )
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

  it('adds Matching documents and License stamp on day 2', () => {
    for (const id of ['matching-documents', 'license-stamp']) {
      expect(regulationsForDay(1).map((r) => r.id)).not.toContain(id)
      expect(regulationsForDay(2).map((r) => r.id)).toContain(id)
    }
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
      generateShip(mulberry32(i), { arrivalNo: i + 1, day, regulations, ctx }),
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
        if (license.vesselName !== report.vesselName) {
          expect(findViolations({ report, license }, regulations, ctx).map((r) => r.id)).toContain('matching-documents')
        }
        expect(license.licenseNumber).toMatch(/^L-\d{6}$/)
        expect(compareDates(license.expires, date)).toBeGreaterThan(0)
      }
    })

    it(`mixes legal and illegal ships roughly evenly (day ${day})`, () => {
      const legal = ships.filter((s) => findViolations(s.actual, regulations, ctx).length === 0).length
      expect(legal).toBeGreaterThan(60)
      expect(legal).toBeLessThan(140)
    })
  }

  it('is deterministic for a seed', () => {
    const opts = { arrivalNo: 1, day: 1, regulations: regulationsForDay(1), ctx: { date: START_DATE, biodiversity: 100 } }
    expect(generateShip(mulberry32(42), opts)).toEqual(generateShip(mulberry32(42), opts))
  })
})

// ---- falsified reports ----

describe('falsified reports', () => {
  const shipsOn = (day: number, n = 400) => {
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    const regulations = regulationsForDay(day)
    const ships = Array.from({ length: n }, (_, i) => generateShip(mulberry32(1000 + i), { arrivalNo: 1, day, regulations, ctx }))
    return { ships, regulations, ctx }
  }

  it('never happen on days 1 and 2: every report is the truth', () => {
    for (const day of [1, 2]) {
      for (const ship of shipsOn(day, 100).ships) {
        expect(ship.lies).toEqual([])
        expect(ship.actual).toEqual({ report: ship.report, license: ship.license })
      }
    }
  })

  it('on day 3, give 40% of illegal vessels paperwork with nothing wrong on it', () => {
    const { ships, regulations, ctx } = shipsOn(3, 1000)
    const illegal = ships.filter((s) => findViolations(s.actual, regulations, ctx).length > 0)
    const clean = illegal.filter((s) => findViolations(s, regulations, ctx).length === 0)
    for (const s of clean) expect(s.lies.length).toBeGreaterThan(0)
    expect(clean.length / illegal.length).toBeGreaterThan(FALSIFIED_REPORTS.cleanPaperwork.chance - 0.06)
    expect(clean.length / illegal.length).toBeLessThan(FALSIFIED_REPORTS.cleanPaperwork.chance + 0.06)
  })

  it('on day 3, leave legal vessels without harmless mismatches', () => {
    const { ships, regulations, ctx } = shipsOn(3)
    for (const s of ships.filter((s) => findViolations(s.actual, regulations, ctx).length === 0)) {
      expect(s.actual).toEqual({ report: s.report, license: s.license })
    }
  })

  it('make an illegal vessel look legal on paper, and only use lies unlocked by that day', () => {
    for (const day of [4, 6, 9, 12]) {
      const { ships, regulations, ctx } = shipsOn(day)
      const liars = ships.filter((s) => s.lies.length > 0)
      expect(liars.length).toBeGreaterThan(20)
      for (const s of liars) {
        expect(findViolations(s, regulations, ctx)).toEqual([])
        expect(findViolations(s.actual, regulations, ctx).length).toBeGreaterThan(0)
        for (const lie of s.lies) expect(day).toBeGreaterThanOrEqual(FALSIFIED_REPORTS.lieFromDay[lie])
      }
    }
  })

  it('leave evidence for the tool that exposes each lie', () => {
    const { ships } = shipsOn(12)
    for (const s of ships.filter((s) => s.lies.length > 0)) {
      if (s.lies.includes('tracking')) expect(s.actual.report.fishingRegion).not.toBe(s.report.fishingRegion)
      if (s.lies.includes('catch')) expect(s.actual.report).not.toEqual(s.report)
      if (s.lies.includes('license')) expect(s.actual.license.permits).not.toEqual(s.license.permits)
    }
  })

  it('include harmless mismatches on legal vessels', () => {
    const { ships, regulations, ctx } = shipsOn(6)
    const innocent = ships.filter(
      (s) => s.lies.length === 0 && findViolations(s.actual, regulations, ctx).length === 0 && s.actual.report !== s.report,
    )
    expect(innocent.length).toBeGreaterThan(5)
  })

  it('flag liars with prior violations more often than honest vessels', () => {
    const { ships } = shipsOn(12, 600)
    const rate = (list: typeof ships) => list.filter((s) => s.priorViolations > 0).length / list.length
    expect(rate(ships.filter((s) => s.lies.length > 0))).toBeGreaterThan(rate(ships.filter((s) => s.lies.length === 0)) + 0.2)
  })

  it('can force the guided example: a report hiding where the vessel fished', () => {
    const day = 4
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    for (let i = 0; i < 20; i++) {
      const s = generateShip(mulberry32(i), { arrivalNo: 1, day, regulations: regulationsForDay(day), ctx, requireLie: 'tracking' })
      expect(s.lies).toEqual(['tracking'])
    }
  })
})

// ---- blacklist ----

describe('blacklist', () => {
  const blacklist = ['The Iron Gull', 'The Quiet Tide', 'The Lucky Heron', 'The Salty Anchor', 'The Golden Marlin']

  const shipsOn = (day: number, n = 1500) => {
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    const regulations = regulationsForDay(day)
    const ships = Array.from({ length: n }, (_, i) =>
      generateShip(mulberry32(5000 + i), { arrivalNo: 1, day, regulations, ctx, blacklist }),
    )
    const illegal = ships.filter((s) => findViolations(s.actual, regulations, ctx).length > 0)
    return { ships, illegal, regulations, ctx }
  }
  const listed = (s: { report: { vesselName: string } }) => blacklist.includes(s.report.vesselName)

  it('has 5 to 10 distinct names', () => {
    for (let i = 0; i < 50; i++) {
      const names = generateBlacklist(mulberry32(i))
      expect(names.length).toBeGreaterThanOrEqual(BLACKLIST.size[0])
      expect(names.length).toBeLessThanOrEqual(BLACKLIST.size[1])
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('never lists a legal vessel', () => {
    for (const day of [3, 8]) {
      const { ships, illegal } = shipsOn(day, 400)
      for (const s of ships.filter((s) => !illegal.includes(s))) expect(listed(s)).toBe(false)
    }
  })

  it('on day 3, lists every illegal vessel whose paperwork looks legal, since nothing else can catch it', () => {
    const { illegal, regulations, ctx } = shipsOn(3)
    const cleanLooking = illegal.filter((s) => findViolations(s, regulations, ctx).length === 0)
    expect(cleanLooking.length).toBeGreaterThan(0)
    for (const s of cleanLooking) expect(listed(s)).toBe(true)
  })

  it('lists about a third of illegal vessels that can be caught some other way', () => {
    const { illegal, regulations, ctx } = shipsOn(3)
    const flawed = illegal.filter((s) => findViolations(s, regulations, ctx).length > 0)
    const rate = flawed.filter(listed).length / flawed.length
    expect(rate).toBeGreaterThan(BLACKLIST.chance - 0.06)
    expect(rate).toBeLessThan(BLACKLIST.chance + 0.06)
  })

  it('from day 4, lists about a third of illegal vessels, including ones whose paperwork looks legal', () => {
    for (const day of [8]) {
      const { illegal, regulations, ctx } = shipsOn(day)
      const rate = illegal.filter(listed).length / illegal.length
      expect(rate).toBeGreaterThan(BLACKLIST.chance - 0.06)
      expect(rate).toBeLessThan(BLACKLIST.chance + 0.06)
      const cleanLooking = illegal.filter((s) => findViolations(s, regulations, ctx).length === 0)
      expect(cleanLooking.filter(listed).length).toBeGreaterThan(0)
      for (const s of illegal.filter(listed)) {
        expect(s.actual.report.vesselName).toBe(s.report.vesselName)
        expect(s.actual.license.vesselName).toBe(s.license.vesselName)
      }
    }
  })

  it('never lists the guided example', () => {
    const day = 4
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    for (let i = 0; i < 50; i++) {
      const s = generateShip(mulberry32(i), { arrivalNo: 1, day, regulations: regulationsForDay(day), ctx, requireLie: 'tracking', blacklist })
      expect(listed(s)).toBe(false)
    }
  })
})

// ---- flawed licenses ----

describe('flawed licenses', () => {
  const flawOf = (s: Ship) =>
    s.license.vesselName !== s.report.vesselName ? 'name' : s.license.stamp === null ? 'missing-stamp' : s.license.stamp !== 'official' ? 'forged-stamp' : null

  const shipsOn = (day: number, n = 1500) => {
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    const regulations = regulationsForDay(day)
    const ships = Array.from({ length: n }, (_, i) => generateShip(mulberry32(9000 + i), { arrivalNo: 1, day, regulations, ctx }))
    const illegal = ships.filter((s) => findViolations(s.actual, regulations, ctx).length > 0)
    const flawed = ships.filter((s) => flawOf(s) !== null)
    return { ships, illegal, flawed, regulations, ctx }
  }

  it('name a vessel one word off', () => {
    for (let i = 0; i < 50; i++) {
      const name = misnamed(mulberry32(i), 'The Silver Petrel')
      expect(name).not.toBe('The Silver Petrel')
      const [, a, n] = name.split(' ')
      expect(Number(a === 'Silver') + Number(n === 'Petrel')).toBe(1)
    }
  })

  it('never appear on day 1: every license names its vessel and has the official stamp', () => {
    expect(shipsOn(1, 400).flawed).toEqual([])
  })

  it('appear from day 2 on illegal vessels only, in plain sight', () => {
    for (const day of [2, 3, 6, 12]) {
      const { illegal, flawed, regulations, ctx } = shipsOn(day)
      expect(flawed.length).toBeGreaterThan(0)
      for (const s of flawed) {
        expect(illegal).toContain(s)
        expect(s.lies).toEqual([])
        expect(s.actual).toEqual({ report: s.report, license: s.license })
        const rule = flawOf(s) === 'name' ? 'matching-documents' : 'license-stamp'
        expect(findViolations(s, regulations, ctx).map((r) => r.id)).toContain(rule)
      }
    }
  })

  it('make up about a quarter of illegal vessels on day 2, split between the three kinds', () => {
    const { illegal, flawed } = shipsOn(2, 3000)
    const rate = flawed.length / illegal.length
    expect(rate).toBeGreaterThan(LICENSE_DISCREPANCY.chance - 0.05)
    expect(rate).toBeLessThan(LICENSE_DISCREPANCY.chance + 0.05)
    for (const kind of ['name', 'missing-stamp', 'forged-stamp']) {
      const share = flawed.filter((s) => flawOf(s) === kind).length / flawed.length
      expect(share).toBeGreaterThan(0.25)
      expect(share).toBeLessThan(0.42)
    }
    const forged = new Set(flawed.map((s) => s.license.stamp).filter((k) => k && k !== 'official'))
    expect([...forged].sort()).toEqual([...FORGED_STAMPS].sort())
  })

  it('stay mismatched when the vessel is given a blacklisted name', () => {
    const blacklist = ['The Iron Gull', 'The Quiet Tide', 'The Lucky Heron', 'The Salty Anchor', 'The Golden Marlin']
    const day = 6
    const ctx = { date: dateOfDay(START_DATE, day), biodiversity: 100 }
    const ships = Array.from({ length: 2000 }, (_, i) =>
      generateShip(mulberry32(i), { arrivalNo: 1, day, regulations: regulationsForDay(day), ctx, blacklist }),
    )
    const listedMismatch = ships.filter((s) => blacklist.includes(s.report.vesselName) && s.license.vesselName !== s.report.vesselName)
    expect(listedMismatch.length).toBeGreaterThan(0)
  })
})
