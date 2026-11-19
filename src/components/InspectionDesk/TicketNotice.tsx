import type { Ticket } from '../../game/types'
import { BIODIVERSITY } from '../../data/start'
import { ECONOMY } from '../../data/economy'
import { useDismiss } from './useDismiss'
import styles from './TicketNotice.module.css'

interface TicketNoticeProps {
  ticket: Ticket
  onDismiss: () => void
}

const pad3 = (n: number) => String(n).padStart(3, '0')

/**
 * Pops up after a wrong decision, explaining what the player missed. It sits in the top strip
 * (harbor window and stats) so the vessel's papers stay readable on the desk below, but the whole
 * game is paused and locked until it's dismissed.
 */
export function TicketNotice({ ticket, onDismiss }: TicketNoticeProps) {
  const button = useDismiss(onDismiss)

  const accepted = ticket.decision === 'accept'

  return (
    <div className={`${styles.backdrop} ${styles.reviewBackdrop}`}>
      <article
        className={`${styles.ticket} ${styles.review}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ticket-title"
        aria-describedby="ticket-body"
      >
        <p className={styles.meta}>
          Port Authority &nbsp;/&nbsp; Arrival No. {pad3(ticket.arrivalNo)}
        </p>
        <h2 id="ticket-title" className={styles.title}>
          Inspection Error
        </h2>

        <div id="ticket-body" className={styles.body}>
          <p className={styles.summary}>
            You {accepted ? 'accepted' : 'rejected'}{' '}
            <span className={styles.vessel}>{ticket.vesselName}</span>.
          </p>

          {ticket.issues.length > 0 ? (
            <div className={styles.columns}>
              <div>
                <p className={styles.label}>You should have noticed</p>
                <ul className={styles.issues}>
                  {ticket.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
              {ticket.hidden.length > 0 && (
                <div>
                  <p className={styles.label}>Its report was falsified. Verification would have shown</p>
                  <ul className={styles.issues}>
                    {ticket.hidden.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.legal}>
              This vessel was legal. It met every regulation in force today, and the fishing industry has filed a
              complaint.
            </p>
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.hint}>
            {accepted
              ? 'The port got paid. The ocean paid for it.'
              : "The papers on the desk are this vessel's."}
          </span>
          <span className={styles.penalty}>
            {accepted
              ? `Port fees +$${ECONOMY.acceptRevenue} · Marine Biodiversity −${BIODIVERSITY.wrongPenalty}%`
              : `Industry complaint −$${ECONOMY.wrongRejectFine}`}
          </span>
          <button ref={button} type="button" className={styles.button} onClick={onDismiss}>
            Understood
          </button>
        </footer>

        <span className={styles.stamp} aria-hidden="true">
          {accepted ? 'Missed' : 'Legal'}
        </span>
      </article>
    </div>
  )
}
