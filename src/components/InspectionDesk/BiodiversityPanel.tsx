import { BIODIVERSITY } from '../../data/start'
import { PELAGIC_CLOSURE_THRESHOLD } from '../../data/regulations'
import styles from './BiodiversityPanel.module.css'

const SEGMENTS = 20

interface BiodiversityPanelProps {
  biodiversity: number
  /** Show the daily recovery note. */
  newDay: boolean
}

/** The player's health bar. */
export function BiodiversityPanel({ biodiversity, newDay }: BiodiversityPanelProps) {
  const value = Math.max(0, Math.min(100, Math.round(biodiversity)))
  const filled = Math.round((value / 100) * SEGMENTS)
  const low = value <= PELAGIC_CLOSURE_THRESHOLD

  return (
    <section className={`${styles.panel} ${low ? styles.low : ''}`} aria-label="Marine biodiversity">
      <div className={styles.labelRow}>
        <h2 className={styles.label}>Marine Biodiversity</h2>
        <span className={styles.value}>{value}%</span>
      </div>

      <div
        className={styles.bar}
        role="meter"
        aria-label="Marine biodiversity"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={i < filled ? styles.on : styles.off} />
        ))}
      </div>

      <p className={styles.feedback} aria-live="polite">
        {newDay && <span className={styles.good}>New day  +{BIODIVERSITY.dailyRecovery}%</span>}
      </p>
    </section>
  )
}
