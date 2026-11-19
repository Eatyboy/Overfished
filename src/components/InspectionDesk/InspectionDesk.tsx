import { useCallback } from 'react'
import { useGameStore } from '../../store/gameStore'
import { clockMinutes, formatClock } from '../../game/clock'
import { freeInspections, habitatRecovery, hasTool, inspectionCost } from '../../game/loop'
import type { Tool } from '../../game/types'
import { useShiftTimer } from './useShiftTimer'
import { DeskHeader } from './DeskHeader'
import { HarborWindow } from './HarborWindow'
import { BiodiversityPanel } from './BiodiversityPanel'
import { VerificationPanel } from './VerificationPanel'
import { FishingReport } from './FishingReport'
import { FishingLicense } from './FishingLicense'
import { PortRegulations } from './PortRegulations'
import { DecisionBar } from './DecisionBar'
import { TicketNotice } from './TicketNotice'
import { EvidenceNotice } from './EvidenceNotice'
import { BulletinNotice } from './BulletinNotice'
import styles from './InspectionDesk.module.css'

/**
 * The main play screen, laid out in 1440×900 stage units to match Figma.
 * All content comes from the store, so the game loop only needs to update state.
 */
export function InspectionDesk() {
  const shift = useGameStore((s) => s.shift)
  const biodiversity = useGameStore((s) => s.biodiversity)
  const money = useGameStore((s) => s.money)
  const owned = useGameStore((s) => s.owned)
  const inspectionsUsed = useGameStore((s) => s.inspectionsUsed)
  const inspected = useGameStore((s) => s.inspected)
  const viewing = useGameStore((s) => s.viewing)
  const bulletin = useGameStore((s) => s.bulletin)
  const newDay = useGameStore((s) => s.newDay)
  const clock = useGameStore((s) => formatClock(clockMinutes(s.elapsedMs)))
  const tick = useGameStore((s) => s.tick)
  const ship = useGameStore((s) => s.ship)
  const regulations = useGameStore((s) => s.regulations)
  const blacklist = useGameStore((s) => s.blacklist)
  const decide = useGameStore((s) => s.decide)
  const ticket = useGameStore((s) => s.ticket)
  const dismissTicket = useGameStore((s) => s.dismissTicket)
  const inspect = useGameStore((s) => s.inspect)
  const closeEvidence = useGameStore((s) => s.closeEvidence)
  const dismissBulletin = useGameStore((s) => s.dismissBulletin)

  // The shift clock pauses while any notice is open.
  useShiftTimer(tick, ticket !== null || viewing !== null || bulletin)

  const freeTotal = freeInspections({ owned })
  const available = useCallback((tool: Tool) => hasTool({ shift, owned }, tool), [shift, owned])

  return (
    <main className={styles.screen}>
      <DeskHeader shift={shift} clock={clock} />

      <section className={styles.top}>
        <HarborWindow vesselNumber={shift.vesselNumber} />
        <BiodiversityPanel biodiversity={biodiversity} recovered={newDay ? habitatRecovery({ owned }) : 0} />
        <VerificationPanel
          money={money}
          freeLeft={Math.max(0, freeTotal - inspectionsUsed)}
          freeTotal={freeTotal}
          cost={inspectionCost({ owned, inspectionsUsed })}
          available={available}
          inspected={inspected}
          onInspect={inspect}
        />
      </section>

      <section className={styles.desk}>
        <span className={styles.bolt} style={{ left: 50 }} aria-hidden="true" />
        <span className={styles.bolt} style={{ left: 1386 }} aria-hidden="true" />

        <FishingReport report={ship.report} />
        <FishingLicense license={ship.license} priorViolations={ship.priorViolations} />
        <PortRegulations shift={shift} regulations={regulations} blacklist={blacklist} />
        <DecisionBar arrivalNo={ship.report.arrivalNo} onDecide={decide} />
      </section>

      {bulletin && <BulletinNotice onDismiss={dismissBulletin} />}
      {!bulletin && viewing && <EvidenceNotice ship={ship} tool={viewing} onClose={closeEvidence} />}
      {ticket && <TicketNotice ticket={ticket} onDismiss={dismissTicket} />}
    </main>
  )
}
