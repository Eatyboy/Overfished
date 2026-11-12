import type { InspectionContext, Regulation, Ship } from './types'
import { DAY_REGULATIONS, STATIC_REGULATIONS } from '../data/regulations'

/** The regulations sheet for a given day: static rules plus that day's rules. */
export function regulationsForDay(day: number): Regulation[] {
  return [...STATIC_REGULATIONS, ...(DAY_REGULATIONS[day] ?? [])]
}

/** Explanations of every rule the ship breaks. Empty means the ship should be accepted. */
export function findIssues(ship: Ship, regulations: Regulation[], ctx: InspectionContext): string[] {
  return regulations.flatMap((rule) => rule.findIssue(ship, ctx) ?? [])
}

/** Rules the ship breaks. */
export function findViolations(
  ship: Ship,
  regulations: Regulation[],
  ctx: InspectionContext,
): Regulation[] {
  return regulations.filter((rule) => rule.findIssue(ship, ctx) !== null)
}
