import { create } from 'zustand'

export type Screen = 'title' | 'desk'

export interface GameState {
  screen: Screen
  /** Current day (1–12). Each day is the first of a new month. */
  day: number
  startShift: () => void
  returnToTitle: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  screen: 'title',
  day: 1,
  startShift: () => set({ screen: 'desk' }),
  returnToTitle: () => set({ screen: 'title' }),
}))
