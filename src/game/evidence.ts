import type { Ship, Tool } from './types'

const lower = (s: string) => s.toLowerCase()

/** "a", "a and b", "a, b and c" */
const list = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

/** What one tool would have exposed about a falsified report, for the ticket. */
export function revealedBy(ship: Ship, tool: Tool): string {
  const { report, actual } = ship
  switch (tool) {
    case 'tracking':
      return `Vessel Tracking: the vessel was really in ${actual.report.fishingRegion}, not ${report.fishingRegion}.`
    case 'catch': {
      const reported = new Set(report.catches.map((c) => c.species))
      const hidden = actual.report.catches.filter((c) => !reported.has(c.species)).map((c) => lower(c.species))
      if (actual.report.bait !== report.bait && actual.report.bait) hidden.push(`${lower(actual.report.bait)} bait`)
      return `Catch Verification: the hold also had ${list(hidden)}, left off the report.`
    }
    case 'license': {
      const permits = actual.license.permits
      return `License Database: ${permits.length ? `only ${list(permits)} on file` : 'no permits on file'}; the license shown was forged.`
    }
  }
}
