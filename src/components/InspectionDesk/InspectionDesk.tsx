import { useCallback } from 'react'
import { useGameStore } from '../../store/gameStore'
import { clockMinutes } from '../../game/clock'
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
import { BlacklistDocument } from './BlacklistDocument'
import { useDeskDocuments } from './useDeskDocuments'
import { DecisionBar } from './DecisionBar'
import { TicketNotice } from './TicketNotice'
import { EvidenceNotice } from './EvidenceNotice'
import { BulletinNotice } from './BulletinNotice'
import { BriefingNotice } from './BriefingNotice'
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
  const briefing = useGameStore((s) => s.briefing)
  const bulletin = useGameStore((s) => s.bulletin)
  const newDay = useGameStore((s) => s.newDay)
  const minutes = useGameStore((s) => clockMinutes(s.elapsedMs))
  const tick = useGameStore((s) => s.tick)
  const ship = useGameStore((s) => s.ship)
  const regulations = useGameStore((s) => s.regulations)
  const blacklist = useGameStore((s) => s.blacklist)
  const decide = useGameStore((s) => s.decide)
  const ticket = useGameStore((s) => s.ticket)
  const dismissTicket = useGameStore((s) => s.dismissTicket)
  const inspect = useGameStore((s) => s.inspect)
  const closeEvidence = useGameStore((s) => s.closeEvidence)
  const dismissBriefing = useGameStore((s) => s.dismissBriefing)
  const dismissBulletin = useGameStore((s) => s.dismissBulletin)

  const drag = useDeskDocuments()

  // The shift clock waits for the start-of-day briefing, and pauses while any notice is open.
  useShiftTimer(tick, briefing || ticket !== null || viewing !== null || bulletin)

  // While a ticket is open the desk keeps showing the vessel the player got wrong.
  const onDesk = ticket?.ship ?? ship
  const freeTotal = freeInspections({ owned })
  const available = useCallback((tool: Tool) => hasTool({ shift, owned }, tool), [shift, owned])

  return (
    <main className={styles.screen}>
      <DeskHeader shift={shift} minutes={minutes} />

      <section className={styles.top}>
        <HarborWindow
          // While a ticket is open the decided vessel is still at the booth.
          vesselNumber={ticket ? shift.vesselNumber - 1 : shift.vesselNumber}
          arrivalNo={onDesk.report.arrivalNo}
          minutes={minutes}
        />
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

        <DecisionBar reviewing={ticket !== null} onDecide={decide} />

        {/* Documents come after the decision bar so they can be laid over it. */}
        <FishingReport report={onDesk.report} drag={drag('report')} />
        <FishingLicense license={onDesk.license} priorViolations={onDesk.priorViolations} drag={drag('license')} />
        <PortRegulations shift={shift} regulations={regulations} drag={drag('regulations')} />
        {blacklist.length > 0 && <BlacklistDocument names={blacklist} drag={drag('blacklist')} />}
      </section>

      {/* Start of day: the briefing first, then (Day 4) the bulletin. */}
      {briefing && <BriefingNotice shift={shift} onDismiss={dismissBriefing} />}
      {!briefing && bulletin && <BulletinNotice onDismiss={dismissBulletin} />}
      {!briefing && !bulletin && viewing && <EvidenceNotice ship={ship} tool={viewing} onClose={closeEvidence} />}
      {ticket && <TicketNotice ticket={ticket} onDismiss={dismissTicket} />}
    </main>
  )
}
