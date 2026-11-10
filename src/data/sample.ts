import type { ArrivalReport, Regulation, ShiftInfo, Stats } from '../game/types'

/*
 * Placeholder content matching the Figma inspection desk.
 * Replace with generated ships and per-day rule sets once the game loop exists.
 */

export const INITIAL_STATS: Stats = {
  fishPopulation: 50,
  ecosystemHealth: 50,
  fishingIndustry: 50,
  affordability: 50,
}

export const SAMPLE_SHIFT: ShiftInfo = {
  day: 1,
  date: '06 NOV 1986',
  time: '08:15',
  location: 'North Pier',
  booth: 'Inspection Booth 04',
  order: 1,
  vesselNumber: 1,
  vesselsToday: 8,
}

export const SAMPLE_REPORT: ArrivalReport = {
  arrivalNo: 1,
  captain: 'Mara Voss',
  vesselName: 'The Petrel',
  origin: 'North Pier',
  registration: 'NP-047',
  permit: { number: 'F-1986-042', expires: '30 NOV 1986' },
  declaredCatch: [
    { species: 'Cod', weightKg: 180, minSizeCm: 38 },
    { species: 'Haddock', weightKg: 40, minSizeCm: 32 },
  ],
  fishingGround: 'North Bank',
}

export const SAMPLE_REGULATIONS: Regulation[] = [
  {
    id: 'permit',
    title: 'Valid fishing permit',
    description: 'Permit must be valid on arrival.',
  },
  {
    id: 'allowance',
    title: 'Catch allowance',
    description: 'Cod & haddock only. Maximum 250 kg.',
  },
  {
    id: 'min-size',
    title: 'Minimum fish size',
    description: 'Cod: 35 cm  /  Haddock: 30 cm.',
  },
  {
    id: 'protected',
    title: 'Protected waters',
    description: 'No fishing in the East Sanctuary.',
  },
]
