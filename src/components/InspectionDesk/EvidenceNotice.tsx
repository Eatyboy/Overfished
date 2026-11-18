import type { Ship, Tool } from '../../game/types'
import { formatDate } from '../../game/date'
import { TOOL_NAMES } from '../../data/economy'
import { useDismiss } from './useDismiss'
import notice from './TicketNotice.module.css'
import styles from './EvidenceNotice.module.css'

interface EvidenceNoticeProps {
  ship: Ship
  tool: Tool
  onClose: () => void
}

const pad3 = (n: number) => String(n).padStart(3, '0')

/**
 * What a verification tool found. It shows evidence side by side with the paperwork, never a verdict:
 * the player still has to check it against the regulations.
 */
export function EvidenceNotice({ ship, tool, onClose }: EvidenceNoticeProps) {
  const button = useDismiss(onClose)
  const { report, license, actual } = ship

  return (
    <div className={notice.backdrop}>
      <article
        className={`${notice.ticket} ${styles.evidence}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-title"
      >
        <p className={notice.meta}>
          {TOOL_NAMES[tool]} &nbsp;/&nbsp; Arrival No. {pad3(report.arrivalNo)}
        </p>
        <h2 id="evidence-title" className={`${notice.title} ${styles.title}`}>
          Inspection Result
        </h2>

        <div className={notice.body}>
          <p className={notice.summary}>
            <span className={notice.vessel}>{report.vesselName}</span>
          </p>

          {tool === 'tracking' && (
            <dl className={styles.compare}>
              <dt>Report says fished in</dt>
              <dd>{report.fishingRegion}</dd>
              <dt>Transponder track places it in</dt>
              <dd className={styles.found}>{actual.report.fishingRegion}</dd>
            </dl>
          )}

          {tool === 'catch' && (
            <>
              <p className={notice.label}>Found in the hold</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Species</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Min. size</th>
                    <th scope="col">Gear</th>
                  </tr>
                </thead>
                <tbody>
                  {actual.report.catches.map((c) => (
                    <tr key={c.species}>
                      <td>{c.species}</td>
                      <td>
                        {c.amount.toLocaleString('en-US')} {c.unit}
                      </td>
                      <td>{c.sizeIn} in</td>
                      <td>{c.gear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className={styles.compare}>
                <dt>Bait on board</dt>
                <dd className={styles.found}>{actual.report.bait ?? 'None'}</dd>
              </dl>
            </>
          )}

          {tool === 'license' && (
            <dl className={styles.compare}>
              <dt>Registry record for</dt>
              <dd>{license.licenseNumber}</dd>
              <dt>Permits on file</dt>
              <dd className={styles.found}>{actual.license.permits.length ? actual.license.permits.join(', ') : 'None'}</dd>
              <dt>Expires</dt>
              <dd className={styles.found}>{formatDate(actual.license.expires)}</dd>
            </dl>
          )}
        </div>

        <footer className={notice.footer}>
          <span className={styles.hint}>Compare with the documents and today's regulations</span>
          <button ref={button} type="button" className={notice.button} onClick={onClose}>
            Close
          </button>
        </footer>
      </article>
    </div>
  )
}
