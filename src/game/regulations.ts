import type { Documents, InspectionContext, Regulation } from './types'
import { DAY_REGULATIONS, STATIC_REGULATIONS } from '../data/regulations'

/** The regulations sheet for a given day: static rules plus that day's rules. */
export function regulationsForDay(day: number): Regulation[] {
  return [...STATIC_REGULATIONS, ...(DAY_REGULATIONS[day] ?? [])]
}

/**
 * Explanations of every rule the documents break. Empty means they comply.
 * Pass `ship.actual` to judge what a vessel really did, or the ship itself to judge its paperwork.
 */
export function findIssues(docs: Documents, regulations: Regulation[], ctx: InspectionContext): string[] {
  return regulations.flatMap((rule) => rule.findIssue(docs, ctx) ?? [])
}

/** Rules the documents break. */
export function findViolations(docs: Documents, regulations: Regulation[], ctx: InspectionContext): Regulation[] {
  return regulations.filter((rule) => rule.findIssue(docs, ctx) !== null)
}
