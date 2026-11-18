import { ECONOMY } from '../../data/economy'
import { useDismiss } from './useDismiss'
import notice from './TicketNotice.module.css'
import styles from './EvidenceNotice.module.css'

interface BulletinNoticeProps {
  onDismiss: () => void
}

/** The Day 4 Port Authority bulletin: falsified reports, and Vessel Tracking is issued. */
export function BulletinNotice({ onDismiss }: BulletinNoticeProps) {
  const button = useDismiss(onDismiss)

  return (
    <div className={notice.backdrop}>
      <article
        className={`${notice.ticket} ${styles.evidence}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulletin-title"
        aria-describedby="bulletin-body"
      >
        <p className={notice.meta}>Port Authority &nbsp;/&nbsp; Bulletin</p>
        <h2 id="bulletin-title" className={`${notice.title} ${styles.title}`}>
          Falsified Reports
        </h2>

        <div id="bulletin-body" className={notice.body}>
          <p className={notice.legal}>
            Some vessels have begun submitting falsified fishing reports. Their paperwork can look perfectly legal.
          </p>
          <ul className={`${notice.issues} ${notice.spaced}`}>
            <li>
              You have been issued <b>Vessel Tracking</b>: compare where a vessel says it fished with where its
              transponder places it.
            </li>
            <li>
              {ECONOMY.freeInspections} inspections a day are free. Each one after that costs ${ECONOMY.inspectionCost}{' '}
              from the port budget.
            </li>
            <li>Tools show evidence, not verdicts. Check what you find against today's regulations.</li>
            <li>Not every mismatch is illegal, and vessels with prior violations are more likely to lie.</li>
          </ul>
          <p className={`${notice.label} ${notice.spaced}`}>The next vessel's paperwork looks clean. Try tracking it.</p>
        </div>

        <footer className={notice.footer}>
          <span className={styles.hint}>More tools in the end-of-day shop</span>
          <button ref={button} type="button" className={notice.button} onClick={onDismiss}>
            Understood
          </button>
        </footer>
      </article>
    </div>
  )
}
