import { create } from 'zustand'
import type { Decision, ShopItem, Tool } from '../game/types'
import {
  advanceTime,
  buy,
  inspect,
  newGame,
  resolveDecision,
  skipToDay,
  startNextDay,
  type Progress,
} from '../game/loop'
import { mulberry32 } from '../game/random'
import { SHIFT_CLOCK } from '../data/start'

export type Screen = 'title' | 'desk' | 'summary' | 'gameOver'

/** Each half of a scene change: fade to black, then back in (1 second in all). */
export const FADE_MS = 500

/**
 * Scene-change fade. `out`: fading to black, with the old screen still showing and input ignored.
 * `in`: the new screen is up and the black is lifting.
 */
export type Fade = 'out' | 'in' | null

export interface GameState extends Progress {
  screen: Screen
  fade: Fade
  /** Start a fresh game and go to the inspection desk. */
  startShift: () => void
  returnToTitle: () => void
  decide: (decision: Decision) => void
  dismissTicket: () => void
  /** Use a verification tool on the ship at the booth. */
  inspect: (tool: Tool) => void
  closeEvidence: () => void
  /** Close the start-of-day briefing, starting the shift clock. */
  dismissBriefing: () => void
  dismissBulletin: () => void
  /** Advance the shift clock by `ms` of real time. */
  tick: (ms: number) => void
  /** Buy an upgrade from the end-of-day shop. */
  buy: (item: ShopItem) => void
  /** Leave the end-of-day summary and start the next shift. */
  nextDay: () => void
  /** Debug: jump straight to the start of any day's shift. From the title or game-over screen, starts a new game first. */
  skipToDay: (day: number) => void
  /** Debug: how many times faster than real time the shift clock runs (1 = normal). Survives new games. */
  speed: number
  setSpeed: (speed: number) => void
  /** Debug: jump the clock to 5 PM, ending today's shift. */
  endDay: () => void
}

const rand = mulberry32(Date.now())

const screenFor = (p: Progress): Screen => (p.outcome ? 'gameOver' : p.phase === 'summary' ? 'summary' : 'desk')
const withScreen = (p: Progress) => ({ ...p, screen: screenFor(p) })

/** Bumped by every scene change, so a superseded one's timers do nothing. */
let sceneChange = 0

export const useGameStore = create<GameState>()((set, get) => {
  /**
   * Apply a new state. If it shows a different screen, fade to black first and apply it only
   * once the screen is black, so the old screen never shows the new state; then fade back in.
   */
  const go = (next: Partial<GameState>) => {
    if (next.screen === undefined || next.screen === get().screen) return set(next)
    const id = ++sceneChange
    set({ fade: 'out' })
    setTimeout(() => {
      if (id !== sceneChange) return
      set({ ...next, fade: 'in' })
      setTimeout(() => id === sceneChange && set({ fade: null }), FADE_MS)
    }, FADE_MS)
  }

  /** While fading out, the state is about to be replaced: ignore input and the clock. */
  const fadingOut = () => get().fade === 'out'

  return {
    ...newGame(rand),
    screen: 'title',
    fade: null,
    speed: 1,
    startShift: () => !fadingOut() && go({ ...newGame(rand), screen: 'desk' }),
    returnToTitle: () => !fadingOut() && go({ screen: 'title' }),
    decide: (decision) => !fadingOut() && go(withScreen(resolveDecision(get(), decision, rand))),
    dismissTicket: () => set({ ticket: null }),
    inspect: (tool) => !fadingOut() && set(inspect(get(), tool)),
    closeEvidence: () => set({ viewing: null }),
    dismissBriefing: () => set({ briefing: false }),
    dismissBulletin: () => set({ bulletin: false }),
    tick: (ms) => !fadingOut() && go(withScreen(advanceTime(get(), ms * get().speed))),
    buy: (item) => !fadingOut() && set(buy(get(), item)),
    nextDay: () => !fadingOut() && go(withScreen(startNextDay(get(), rand))),
    setSpeed: (speed) => set({ speed }),
    endDay: () => !fadingOut() && go(withScreen(advanceTime(get(), SHIFT_CLOCK.realMs))),
    skipToDay: (day) => {
      if (fadingOut()) return
      const s = get()
      const base = s.screen === 'title' || s.outcome ? newGame(rand) : s
      go({ ...skipToDay(base, day, rand), screen: 'desk' })
    },
  }
})
