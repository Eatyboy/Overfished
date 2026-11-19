import { useGameStore } from '../../store/gameStore'
import { TOTAL_DAYS } from '../../data/start'
import styles from './DebugPanel.module.css'

const DAYS = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)
const SPEEDS = [1, 2, 4, 8]

/** A collapsible corner panel for playtesting: jump to any day, speed up the clock, or end the shift. */
export function DebugPanel() {
  const day = useGameStore((s) => s.shift.day)
  const screen = useGameStore((s) => s.screen)
  const skipToDay = useGameStore((s) => s.skipToDay)
  const speed = useGameStore((s) => s.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const endDay = useGameStore((s) => s.endDay)

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

      <p className={styles.label}>Clock speed</p>
      <div className={styles.days}>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            className={styles.day}
            aria-current={s === speed ? 'true' : undefined}
            onClick={() => setSpeed(s)}
          >
            {s}×
          </button>
        ))}
      </div>

      <button type="button" className={`${styles.day} ${styles.wide}`} disabled={screen !== 'desk'} onClick={endDay}>
        End day now
      </button>
    </details>
  )
}
