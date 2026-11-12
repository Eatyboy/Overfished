import { useGameStore } from '../../store/gameStore'
import { clockMinutes, formatClock } from '../../game/clock'
import { useShiftTimer } from './useShiftTimer'
import { DeskHeader } from './DeskHeader'
import { HarborWindow } from './HarborWindow'
import { BiodiversityPanel } from './BiodiversityPanel'
import { FishingReport } from './FishingReport'
import { FishingLicense } from './FishingLicense'
import { PortRegulations } from './PortRegulations'
import { DecisionBar } from './DecisionBar'
import { TicketNotice } from './TicketNotice'
import styles from './InspectionDesk.module.css'

/**
 * The main play screen, laid out in 1440×900 stage units to match Figma.
 * All content comes from the store, so the game loop only needs to update state.
 */
export function InspectionDesk() {
  const shift = useGameStore((s) => s.shift)
  const biodiversity = useGameStore((s) => s.biodiversity)
  const newDay = useGameStore((s) => s.newDay)
  const clock = useGameStore((s) => formatClock(clockMinutes(s.elapsedMs)))
  const tick = useGameStore((s) => s.tick)
  const ship = useGameStore((s) => s.ship)
  const regulations = useGameStore((s) => s.regulations)
  const decide = useGameStore((s) => s.decide)
  const ticket = useGameStore((s) => s.ticket)
  const dismissTicket = useGameStore((s) => s.dismissTicket)

  // The shift clock pauses while a ticket is open.
  useShiftTimer(tick, ticket !== null)

  return (
    <main className={styles.screen}>
      <DeskHeader shift={shift} clock={clock} />

      <section className={styles.top}>
        <HarborWindow vesselNumber={shift.vesselNumber} />
        <BiodiversityPanel biodiversity={biodiversity} newDay={newDay} />
      </section>

      <section className={styles.desk}>
        <span className={styles.bolt} style={{ left: 50 }} aria-hidden="true" />
        <span className={styles.bolt} style={{ left: 1386 }} aria-hidden="true" />

        <FishingReport report={ship.report} />
        <FishingLicense license={ship.license} />
        <PortRegulations shift={shift} regulations={regulations} />
        <DecisionBar arrivalNo={ship.report.arrivalNo} onDecide={decide} />
      </section>

      {ticket && <TicketNotice ticket={ticket} onDismiss={dismissTicket} />}
    </main>
  )
}
