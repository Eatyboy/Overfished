import { create } from 'zustand'
import type { Decision } from '../game/types'
import { advanceTime, newGame, resolveDecision, type Progress } from '../game/loop'
import { mulberry32 } from '../game/random'

export type Screen = 'title' | 'desk' | 'gameOver'

export interface GameState extends Progress {
  screen: Screen
  /** Start a fresh game and go to the inspection desk. */
  startShift: () => void
  returnToTitle: () => void
  decide: (decision: Decision) => void
  dismissTicket: () => void
  /** Advance the shift clock by `ms` of real time. */
  tick: (ms: number) => void
}

const rand = mulberry32(Date.now())

const withScreen = (p: Progress) => ({ ...p, screen: p.outcome ? ('gameOver' as const) : ('desk' as const) })

export const useGameStore = create<GameState>()((set, get) => ({
  ...newGame(rand),
  screen: 'title',
  startShift: () => set({ ...newGame(rand), screen: 'desk' }),
  returnToTitle: () => set({ screen: 'title' }),
  decide: (decision) => set(withScreen(resolveDecision(get(), decision, rand))),
  dismissTicket: () => set({ ticket: null }),
  tick: (ms) => set(withScreen(advanceTime(get(), ms, rand))),
}))
