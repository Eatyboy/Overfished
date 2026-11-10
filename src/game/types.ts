/** The four system stats tracked across the game (0–100). */
export type StatKey = 'fishPopulation' | 'ecosystemHealth' | 'fishingIndustry' | 'affordability'

export type Stats = Record<StatKey, number>

export interface CatchEntry {
  species: string
  weightKg: number
  /** Smallest fish in the hold, in cm. */
  minSizeCm: number
}

export interface FishingPermit {
  number: string
  /** Display date, e.g. "30 NOV 1986". */
  expires: string
}

/** The document a ship hands over on arrival. */
export interface ArrivalReport {
  arrivalNo: number
  captain: string
  vesselName: string
  origin: string
  registration: string
  permit: FishingPermit
  declaredCatch: CatchEntry[]
  fishingGround: string
}

/** One rule on the day's port regulations sheet. */
export interface Regulation {
  id: string
  title: string
  description: string
}

/** Facts about the current shift shown in the header and on documents. */
export interface ShiftInfo {
  day: number
  /** Display date, e.g. "06 NOV 1986". */
  date: string
  time: string
  location: string
  booth: string
  order: number
  vesselNumber: number
  vesselsToday: number
}

export type Decision = 'accept' | 'reject'
