import type { Regulation, ShiftInfo } from '../../game/types'
import paper from './Paper.module.css'
import styles from './PortRegulations.module.css'

interface PortRegulationsProps {
  shift: ShiftInfo
  regulations: Regulation[]
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function PortRegulations({ shift, regulations }: PortRegulationsProps) {
  return (
    <article className={`${paper.paper} ${styles.regulations}`} aria-label="Port regulations">
      <p className={paper.meta}>Ministry of Marine Affairs</p>
      <h2 className={paper.title}>Port Regulations</h2>

      <p className={styles.band}>
        Day {shift.day} &nbsp;/&nbsp; {shift.date} &nbsp;/&nbsp; Order {pad2(shift.order)}
      </p>

      <ol className={styles.rules}>
        {regulations.map((rule, i) => (
          <li key={rule.id} className={styles.rule}>
            <span className={styles.badge} aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <div>
              <h3 className={styles.ruleTitle}>{rule.title}</h3>
              <p className={styles.ruleText}>{rule.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <footer className={`${paper.footer} ${styles.footer}`}>
        <span>Reject if any requirement is not met.</span>
      </footer>
    </article>
  )
}
