import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { INITIAL_STATS } from '../data/sample'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ screen: 'title', stats: INITIAL_STATS })
  })

  it('starts on the title screen on day 1', () => {
    const { screen, shift } = useGameStore.getState()
    expect(screen).toBe('title')
    expect(shift.day).toBe(1)
  })

  it('starts every stat at 50', () => {
    expect(Object.values(useGameStore.getState().stats)).toEqual([50, 50, 50, 50])
  })

  it('moves to the inspection desk when a shift starts', () => {
    useGameStore.getState().startShift()
    expect(useGameStore.getState().screen).toBe('desk')
  })

  it('returns to the title screen', () => {
    useGameStore.getState().startShift()
    useGameStore.getState().returnToTitle()
    expect(useGameStore.getState().screen).toBe('title')
  })
})
