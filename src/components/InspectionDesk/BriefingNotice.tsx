import type { ShiftInfo } from '../../game/types'
import { formatDate } from '../../game/date'
import { newRegulations } from '../../game/regulations'
import { useDismiss } from './useDismiss'
import { Stamp } from './Stamp'
import notice from './TicketNotice.module.css'
import styles from './EvidenceNotice.module.css'

interface BriefingNoticeProps {
  shift: ShiftInfo
  /** Closes the briefing and starts the shift clock. */
  onDismiss: () => void
}

/** Start-of-day briefing on the regulations coming into force today. The shift clock waits for it. */
export function BriefingNotice({ shift, onDismiss }: BriefingNoticeProps) {
  const button = useDismiss(onDismiss)
  const rules = newRegulations(shift.day)
  const first = shift.day === 1

  return (
    <div className={notice.backdrop}>
      <article
        className={`${notice.ticket} ${styles.evidence}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="briefing-title"
        aria-describedby="briefing-body"
      >
        <p className={notice.meta}>
          Ministry of Marine Affairs &nbsp;/&nbsp; Day {shift.day} &nbsp;/&nbsp; {formatDate(shift.date)}
        </p>
        <h2 id="briefing-title" className={`${notice.title} ${styles.title}`}>
          {first ? "Today's Regulations" : 'New Regulations'}
        </h2>

        <div id="briefing-body" className={notice.body}>
          <p className={notice.legal}>
            {first
              && 'Welcome to the booth. Every vessel must meet these rules to dock. Reject any that breaks one.'}
          </p>
          <ul className={`${notice.issues} ${notice.spaced}`}>
            {rules.map((rule) => (
              <li key={rule.id}>
                <b>{rule.title}:</b> {rule.description}
                {rule.figure === 'official-stamp' && (
                  <div>
                    <Stamp kind="official" size={72} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <footer className={`${notice.footer} ${notice.footerCentered}`}>
          <button ref={button} type="button" className={notice.button} onClick={onDismiss}>
            Begin shift
          </button>
        </footer>
      </article>
    </div>
  )
}
