import type { StatKey, Stats } from '../../game/types'
import styles from './StatsPanel.module.css'

const SEGMENTS = 20

const STAT_ORDER: ReadonlyArray<{ key: StatKey; label: string }> = [
  { key: 'fishPopulation', label: 'Fish Population' },
  { key: 'ecosystemHealth', label: 'Marine Ecosystem Health' },
  { key: 'fishingIndustry', label: 'Local Fishing Industry' },
  { key: 'affordability', label: 'Public Satisfaction/Seafood Affordability' },
]

interface StatsPanelProps {
  stats: Stats
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <section className={styles.panel} aria-label="Port stats">
      {STAT_ORDER.map(({ key, label }) => {
        const value = Math.max(0, Math.min(100, Math.round(stats[key])))
        const filled = Math.round((value / 100) * SEGMENTS)
        return (
          <div key={key} className={styles.row}>
            <div className={styles.labelRow}>
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div
              className={styles.bar}
              role="meter"
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
            >
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <span key={i} className={i < filled ? styles.on : styles.off} />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
