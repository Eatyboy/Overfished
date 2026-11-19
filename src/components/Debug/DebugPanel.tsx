import { useGameStore } from '../../store/gameStore'
import { TOTAL_DAYS } from '../../data/start'
import styles from './DebugPanel.module.css'

const DAYS = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)

/** A collapsible corner panel for playtesting: jump to the start of any day. */
export function DebugPanel() {
  const day = useGameStore((s) => s.shift.day)
  const screen = useGameStore((s) => s.screen)
  const skipToDay = useGameStore((s) => s.skipToDay)

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>Debug</summary>
      <p className={styles.label}>Skip to day</p>
      <div className={styles.days}>
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            className={styles.day}
            aria-current={screen !== 'title' && d === day ? 'true' : undefined}
            onClick={() => skipToDay(d)}
          >
            {d}
          </button>
        ))}
      </div>
      <p className={styles.note}>Keeps money, biodiversity and upgrades.</p>
    </details>
  )
}
