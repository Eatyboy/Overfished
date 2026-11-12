import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { BIODIVERSITY } from '../data/start'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().startShift()
    useGameStore.setState({ screen: 'title' })
  })

  it('starts on the title screen on day 1, the first of the month', () => {
    const { screen, shift } = useGameStore.getState()
    expect(screen).toBe('title')
    expect(shift.day).toBe(1)
    expect(shift.date.day).toBe(1)
  })

  it('starts with full marine biodiversity, a ship, and the day 1 regulations', () => {
    const { biodiversity, ship, regulations } = useGameStore.getState()
    expect(biodiversity).toBe(BIODIVERSITY.start)
    expect(ship.report.arrivalNo).toBe(1)
    expect(regulations.map((r) => r.id)).toEqual(['san-diego-waters', 'off-limits'])
  })

  it('moves to the inspection desk when a shift starts', () => {
    useGameStore.getState().startShift()
    expect(useGameStore.getState().screen).toBe('desk')
  })

  it('advances to the next ship after a decision', () => {
    useGameStore.getState().startShift()
    useGameStore.getState().decide('accept')
    expect(useGameStore.getState().shift.vesselNumber).toBe(2)
  })

  it('advances the shift clock and rolls over to the next day', () => {
    useGameStore.getState().startShift()
    useGameStore.getState().tick(60_000)
    expect(useGameStore.getState().elapsedMs).toBe(60_000)
    useGameStore.getState().tick(180_000)
    expect(useGameStore.getState().shift.day).toBe(2)
    expect(useGameStore.getState().elapsedMs).toBe(0)
  })

  it('shows the game-over screen on collapse and resets on play again', () => {
    useGameStore.getState().startShift()
    useGameStore.setState({ biodiversity: BIODIVERSITY.wrongPenalty })
    const { ship, regulations, shift } = useGameStore.getState()
    const legal = regulations.every((r) => r.findIssue(ship, { date: shift.date, biodiversity: 10 }) === null)
    useGameStore.getState().decide(legal ? 'reject' : 'accept') // wrong on purpose

    expect(useGameStore.getState().screen).toBe('gameOver')
    expect(useGameStore.getState().outcome).toBe('collapse')

    useGameStore.getState().startShift()
    expect(useGameStore.getState().screen).toBe('desk')
    expect(useGameStore.getState().biodiversity).toBe(BIODIVERSITY.start)
    expect(useGameStore.getState().outcome).toBeNull()
  })

  it('dismisses the ticket', () => {
    useGameStore.setState({ ticket: { arrivalNo: 1, vesselName: 'The Quiet Gull', decision: 'reject', issues: [] } })
    useGameStore.getState().dismissTicket()
    expect(useGameStore.getState().ticket).toBeNull()
  })

  it('returns to the title screen', () => {
    useGameStore.getState().startShift()
    useGameStore.getState().returnToTitle()
    expect(useGameStore.getState().screen).toBe('title')
  })
})
