import { create } from 'zustand'
import type { ArrivalReport, Decision, Regulation, ShiftInfo, Stats } from '../game/types'
import { INITIAL_STATS, SAMPLE_REGULATIONS, SAMPLE_REPORT, SAMPLE_SHIFT } from '../data/sample'

export type Screen = 'title' | 'desk'

export interface GameState {
  screen: Screen
  shift: ShiftInfo
  stats: Stats
  /** The report for the ship currently at the booth. */
  report: ArrivalReport
  regulations: Regulation[]
  startShift: () => void
  returnToTitle: () => void
  decide: (decision: Decision) => void
}

export const useGameStore = create<GameState>()((set) => ({
  screen: 'title',
  shift: SAMPLE_SHIFT,
  stats: INITIAL_STATS,
  report: SAMPLE_REPORT,
  regulations: SAMPLE_REGULATIONS,
  startShift: () => set({ screen: 'desk' }),
  returnToTitle: () => set({ screen: 'title' }),
  decide: () => {
    // TODO(game loop): score the decision, update stats, bring in the next ship.
  },
}))
