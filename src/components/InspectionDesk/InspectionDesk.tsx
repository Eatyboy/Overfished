import { useGameStore } from '../../store/gameStore'
import styles from './InspectionDesk.module.css'

/**
 * Temporary stand-in so "Start shift" has somewhere to go.
 * To be replaced with the Figma inspection desk (harbor view, stats, arrival report, regulations).
 */
export function InspectionDesk() {
  const day = useGameStore((s) => s.day)
  const returnToTitle = useGameStore((s) => s.returnToTitle)

  return (
    <main className={styles.screen}>
      <h1 className={styles.day}>Day {day}</h1>
      <p className={styles.note}>The inspection desk hasn't been built yet.</p>
      <button type="button" className={styles.back} onClick={returnToTitle}>
        Back to title
      </button>
    </main>
  )
}
