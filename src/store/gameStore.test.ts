import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ screen: 'title', day: 1 })
  })

  it('starts on the title screen on day 1', () => {
    const { screen, day } = useGameStore.getState()
    expect(screen).toBe('title')
    expect(day).toBe(1)
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
