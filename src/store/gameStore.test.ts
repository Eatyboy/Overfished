import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FADE_MS, useGameStore } from './gameStore'
import { BIODIVERSITY } from '../data/start'

const store = () => useGameStore.getState()

/** Let any scene-change fade finish (black, swap, fade back in). */
const settle = () => vi.advanceTimersByTime(2 * FADE_MS)

describe('gameStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({ fade: null })
    store().startShift()
    settle()
    useGameStore.setState({ screen: 'title', fade: null })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('starts on the title screen on day 1, the first of the month', () => {
    const { screen, shift } = store()
    expect(screen).toBe('title')
    expect(shift.day).toBe(1)
    expect(shift.date.day).toBe(1)
  })

  it('starts with full marine biodiversity, a ship, and the day 1 regulations', () => {
    const { biodiversity, ship, regulations } = store()
    expect(biodiversity).toBe(BIODIVERSITY.start)
    expect(ship.report.arrivalNo).toBe(1)
    expect(regulations.map((r) => r.id)).toEqual(['san-diego-waters', 'off-limits'])
  })

  it('moves to the inspection desk when a shift starts', () => {
    store().startShift()
    settle()
    expect(store().screen).toBe('desk')
  })

  describe('scene changes', () => {
    it('fade to black, swap the screen while black, then fade in: 1 second in all', () => {
      store().startShift()
      expect(store()).toMatchObject({ screen: 'title', fade: 'out' })
      vi.advanceTimersByTime(FADE_MS - 1)
      expect(store()).toMatchObject({ screen: 'title', fade: 'out' })
      vi.advanceTimersByTime(1)
      expect(store()).toMatchObject({ screen: 'desk', fade: 'in' })
      vi.advanceTimersByTime(FADE_MS)
      expect(store()).toMatchObject({ screen: 'desk', fade: null })
    })

    it('keep the old screen state until the screen is black', () => {
      store().startShift()
      settle()
      store().tick(180_000)
      settle()
      expect(store().screen).toBe('summary')
      const log = store().log
      store().nextDay()
      // Still the end-of-day ledger while fading out, not the next day's empty one.
      expect(store().log).toBe(log)
      expect(store().shift.day).toBe(1)
      settle()
      expect(store().shift.day).toBe(2)
    })

    it('ignore input and the clock while fading out', () => {
      store().startShift()
      store().startShift()
      store().tick(10_000)
      vi.advanceTimersByTime(FADE_MS)
      expect(store().elapsedMs).toBe(0)
      store().tick(10_000)
      expect(store().elapsedMs).toBe(10_000)
    })

    it('do not fade for changes on the same screen', () => {
      store().startShift()
      settle()
      store().decide('accept')
      expect(store().fade).toBeNull()
      expect(store().shift.vesselNumber).toBe(2)
    })
  })

  it('advances the shift clock, shows the day summary at 5 PM, then starts the next day', () => {
    store().startShift()
    settle()
    store().tick(60_000)
    expect(store().elapsedMs).toBe(60_000)
    store().tick(180_000)
    settle()
    expect(store().screen).toBe('summary')
    store().nextDay()
    settle()
    expect(store().screen).toBe('desk')
    expect(store().shift.day).toBe(2)
    expect(store().elapsedMs).toBe(0)
  })

  it('shows the game-over screen when the port cannot pay its operating expense', () => {
    store().startShift()
    settle()
    useGameStore.setState({ money: 0 })
    store().tick(180_000)
    settle()
    expect(store().screen).toBe('gameOver')
    expect(store().outcome).toBe('bankrupt')
  })

  it('shows the game-over screen on collapse and resets on play again', () => {
    store().startShift()
    settle()
    useGameStore.setState({ biodiversity: BIODIVERSITY.wrongPenalty })
    // Only accepting an illegal ship hurts biodiversity, so accept ships until one is illegal.
    for (let i = 0; i < 500 && store().screen === 'desk'; i++) {
      store().decide('accept')
      settle()
    }

    expect(store().screen).toBe('gameOver')
    expect(store().outcome).toBe('collapse')

    store().startShift()
    settle()
    expect(store().screen).toBe('desk')
    expect(store().biodiversity).toBe(BIODIVERSITY.start)
    expect(store().outcome).toBeNull()
  })

  it('closes the start-of-day briefing', () => {
    store().startShift()
    settle()
    expect(store().briefing).toBe(true)
    store().dismissBriefing()
    expect(store().briefing).toBe(false)
  })

  it('dismisses the ticket', () => {
    useGameStore.setState({ ticket: { arrivalNo: 1, vesselName: 'The Quiet Gull', decision: 'reject', issues: [], hidden: [] } })
    store().dismissTicket()
    expect(store().ticket).toBeNull()
  })

  it('returns to the title screen', () => {
    store().startShift()
    settle()
    store().returnToTitle()
    settle()
    expect(store().screen).toBe('title')
  })

  it('skips to any day from the title screen, starting a new game', () => {
    store().skipToDay(9)
    settle()
    const s = store()
    expect(s.screen).toBe('desk')
    expect(s.shift.day).toBe(9)
    expect(s.outcome).toBeNull()
  })
})
