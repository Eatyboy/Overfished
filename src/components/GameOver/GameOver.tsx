import { useGameStore } from '../../store/gameStore'
import { formatDate } from '../../game/date'
import styles from './GameOver.module.css'

const COPY = {
  collapse: {
    title: 'Collapse',
    body: 'Too much illegal catch slipped through. Marine biodiversity has collapsed and the fishery is closed.',
  },
  complete: {
    title: 'Season complete',
    body: 'You made it through twelve months at the port.',
  },
} as const

export function GameOver() {
  const outcome = useGameStore((s) => s.outcome) ?? 'complete'
  const biodiversity = useGameStore((s) => s.biodiversity)
  const shift = useGameStore((s) => s.shift)
  const startShift = useGameStore((s) => s.startShift)
  const returnToTitle = useGameStore((s) => s.returnToTitle)
  const copy = COPY[outcome]

  return (
    <main className={`${styles.screen} ${outcome === 'collapse' ? styles.collapse : ''}`}>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.body}>{copy.body}</p>
      <p className={styles.stats}>
        Day {shift.day} &nbsp;/&nbsp; {formatDate(shift.date)} &nbsp;/&nbsp; Marine biodiversity {Math.round(biodiversity)}%
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={startShift}>
          Play again
        </button>
        <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={returnToTitle}>
          Title screen
        </button>
      </div>
    </main>
  )
}
