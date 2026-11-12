/** A calendar date. `month` is 1–12. */
export interface GameDate {
  year: number
  month: number
  day: number
}

export type Permit = 'HMS' | 'General Gill/Trammel Net'

/** How a species' amount is recorded: by fish count, or by weight (coastal pelagics). */
export type AmountUnit = 'fish' | 'lb'

export interface CatchEntry {
  species: string
  amount: number
  unit: AmountUnit
  /** Smallest fish in the hold, in inches. */
  sizeIn: number
  /** Gear this species was caught with. */
  gear: string
}

/**
 * The report a ship hands over on arrival: what it caught and how.
 * Report contents change from day to day.
 */
export interface FishingReport {
  arrivalNo: number
  vesselName: string
  fishingRegion: string
  /** 1–3 entries, each with its own gear (so 1–3 pieces of equipment). */
  catches: CatchEntry[]
  /** Bait carried, or null for none. */
  bait: string | null
}

/** The ship's fishing license. Always has the same fields. */
export interface FishingLicense {
  vesselName: string
  licenseNumber: string
  expires: GameDate
  permits: Permit[]
}

/** Everything a ship presents at the booth. */
export interface Ship {
  report: FishingReport
  license: FishingLicense
}

/** What a regulation can see when it checks a ship. */
export interface InspectionContext {
  date: GameDate
  /** Marine Biodiversity, 0–100: the player's health bar. */
  biodiversity: number
}

/** One rule on the day's port regulations sheet. */
export interface Regulation {
  id: string
  title: string
  description: string
  /** Null if the ship complies; otherwise a short explanation of what breaks the rule. */
  findIssue: (ship: Ship, ctx: InspectionContext) => string | null
}

/** Facts about the current shift shown in the header and on documents. */
export interface ShiftInfo {
  /** 1–12. Each day is the first day of a new month. */
  day: number
  date: GameDate
  location: string
  booth: string
  order: number
  /** Ships seen so far today, counting the one at the booth. */
  vesselNumber: number
}

export type Decision = 'accept' | 'reject'

/** How the game ended: biodiversity hit 0, or the player made it through every day. */
export type Outcome = 'collapse' | 'complete'

/** Issued on a wrong decision: what the player should have noticed. */
export interface Ticket {
  arrivalNo: number
  vesselName: string
  decision: Decision
  /** Rule breaches the player missed. Empty if the vessel was legal and was wrongly rejected. */
  issues: string[]
}
