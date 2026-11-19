import type { Regulation, ShiftInfo } from '../../game/types'
import { formatDate } from '../../game/date'
import paper from './Paper.module.css'
import styles from './PortRegulations.module.css'

interface PortRegulationsProps {
  shift: ShiftInfo
  regulations: Regulation[]
  /** Today's blacklisted vessel names; the section is hidden when empty. */
  blacklist: string[]
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function PortRegulations({ shift, regulations, blacklist }: PortRegulationsProps) {
  return (
    <article className={`${paper.paper} ${styles.regulations}`} aria-label="Port regulations">
      <p className={paper.meta}>Ministry of Marine Affairs</p>
      <h2 className={paper.title}>Port Regulations</h2>

      <p className={styles.band}>
        Day {shift.day} &nbsp;/&nbsp; {formatDate(shift.date)} &nbsp;/&nbsp; Order {pad2(shift.order)}
      </p>

      {regulations.length === 0 && <p className={styles.ruleText}>No regulations in force today.</p>}

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

      {blacklist.length > 0 && (
        <section className={styles.blacklist} aria-label="Blacklist">
          <h3 className={styles.blacklistTitle}>Blacklist &nbsp;/&nbsp; Reject on sight</h3>
          <ul className={styles.names}>
            {blacklist.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className={`${paper.footer} ${styles.footer}`}>
        <span>Reject if any requirement is not met.</span>
      </footer>
    </article>
  )
}
