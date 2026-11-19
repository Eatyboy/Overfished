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

/** A forged stamp: the official design with one thing wrong (the port named, the ink colour, or the shape). */
export type ForgedStamp = 'wrong-port' | 'wrong-ink' | 'wrong-shape'

/** The stamp on a license: the official Port Authority stamp, a forgery, or none at all (null). */
export type StampKind = 'official' | ForgedStamp | null

/** The ship's fishing license. Always has the same fields. */
export interface FishingLicense {
  vesselName: string
  licenseNumber: string
  expires: GameDate
  permits: Permit[]
  stamp: StampKind
}

/** A fishing report and license together: what regulations are checked against. */
export interface Documents {
  report: FishingReport
  license: FishingLicense
}

/** A verification tool. Each reveals one part of what the vessel really did. */
export type Tool = 'tracking' | 'catch' | 'license'

/**
 * Everything a ship presents at the booth (`report`, `license`), plus what it really did (`actual`).
 * Honest ships present their actual documents. Regulations are judged against `actual`.
 */
export interface Ship extends Documents {
  /** The vessel's real fishing activity and license record. Hidden until verified. */
  actual: Documents
  /** Tools that would expose a lie hiding a violation. Empty for honest ships. */
  lies: Tool[]
  /** Violations on the port's record for this vessel: a free, imperfect risk signal. */
  priorViolations: number
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
  /** A picture shown with the rule on the regulations sheet. */
  figure?: 'official-stamp'
  /** Null if the ship complies; otherwise a short explanation of what breaks the rule. */
  findIssue: (docs: Documents, ctx: InspectionContext) => string | null
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

/** How the game ended: biodiversity hit 0, the port ran out of money, or the player made it through every day. */
export type Outcome = 'collapse' | 'bankrupt' | 'complete'

/** Issued on a wrong decision: what the player should have noticed. */
export interface Ticket {
  arrivalNo: number
  vesselName: string
  decision: Decision
  /** Rule breaches the player missed. Empty if the vessel was legal and was wrongly rejected. */
  issues: string[]
  /** For falsified reports: what each verification tool would have revealed. */
  hidden: string[]
  /** The vessel the player got wrong, kept on the desk while the ticket is open so they can see why. */
  ship: Ship
}

/** Upgrades sold in the end-of-day shop. */
export type ShopItem = 'catch' | 'license' | 'inspector' | 'habitat'

/** Money and decisions for one day, shown on the end-of-day summary. */
/** A wrong decision, listed on the end-of-day ledger. */
export interface Mistake {
  arrivalNo: number
  vesselName: string
  decision: Decision
  /** What the player missed, or that the vessel was legal. */
  reason: string
}

/** Running totals for the whole season, shown in the end-of-game debrief. */
export interface SeasonLog {
  vessels: number
  illegalRejected: number
  illegalAccepted: number
  /** Illegal vessels accepted whose paperwork had been falsified to look legal. */
  falsifiedAccepted: number
  /** For falsified vessels accepted: how many each tool would have exposed. */
  missedByTool: Record<Tool, number>
  legalRejected: number
}

export interface DayLog {
  accepted: number
  rejected: number
  mistakes: number
  /** Today's wrong decisions, in order. */
  errors: Mistake[]
  revenue: number
  fines: number
  inspectionFees: number
  /** Operating expense paid at the end of the day (0 until then). */
  expense: number
  biodiversityStart: number
}
