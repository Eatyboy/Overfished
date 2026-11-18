import { create } from 'zustand'
import type { Decision, ShopItem, Tool } from '../game/types'
import {
  advanceTime,
  buy,
  inspect,
  newGame,
  resolveDecision,
  startNextDay,
  type Progress,
} from '../game/loop'
import { mulberry32 } from '../game/random'

export type Screen = 'title' | 'desk' | 'summary' | 'gameOver'

export interface GameState extends Progress {
  screen: Screen
  /** Start a fresh game and go to the inspection desk. */
  startShift: () => void
  returnToTitle: () => void
  decide: (decision: Decision) => void
  dismissTicket: () => void
  /** Use a verification tool on the ship at the booth. */
  inspect: (tool: Tool) => void
  closeEvidence: () => void
  dismissBulletin: () => void
  /** Advance the shift clock by `ms` of real time. */
  tick: (ms: number) => void
  /** Buy an upgrade from the end-of-day shop. */
  buy: (item: ShopItem) => void
  /** Leave the end-of-day summary and start the next shift. */
  nextDay: () => void
}

const rand = mulberry32(Date.now())

const screenFor = (p: Progress): Screen => (p.outcome ? 'gameOver' : p.phase === 'summary' ? 'summary' : 'desk')
const withScreen = (p: Progress) => ({ ...p, screen: screenFor(p) })

export const useGameStore = create<GameState>()((set, get) => ({
  ...newGame(rand),
  screen: 'title',
  startShift: () => set({ ...newGame(rand), screen: 'desk' }),
  returnToTitle: () => set({ screen: 'title' }),
  decide: (decision) => set(withScreen(resolveDecision(get(), decision, rand))),
  dismissTicket: () => set({ ticket: null }),
  inspect: (tool) => set(inspect(get(), tool)),
  closeEvidence: () => set({ viewing: null }),
  dismissBulletin: () => set({ bulletin: false }),
  tick: (ms) => set(withScreen(advanceTime(get(), ms))),
  buy: (item) => set(buy(get(), item)),
  nextDay: () => set(withScreen(startNextDay(get(), rand))),
}))
