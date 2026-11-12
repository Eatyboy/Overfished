import { useEffect, useRef } from 'react'
import type { Ticket } from '../../game/types'
import { BIODIVERSITY } from '../../data/start'
import styles from './TicketNotice.module.css'

interface TicketNoticeProps {
  ticket: Ticket
  onDismiss: () => void
}

const pad3 = (n: number) => String(n).padStart(3, '0')

/** Pops up over the desk after a wrong decision, explaining what the player missed. */
export function TicketNotice({ ticket, onDismiss }: TicketNoticeProps) {
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    button.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const accepted = ticket.decision === 'accept'

  return (
    <div className={styles.backdrop}>
      <article
        className={styles.ticket}
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
            <>
              <p className={styles.label}>You should have noticed</p>
              <ul className={styles.issues}>
                {ticket.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.legal}>This vessel was legal. It met every regulation in force today.</p>
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.penalty}>Marine Biodiversity −{BIODIVERSITY.wrongPenalty}%</span>
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
