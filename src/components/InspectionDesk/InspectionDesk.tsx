import { useGameStore } from '../../store/gameStore'
import { DeskHeader } from './DeskHeader'
import { HarborWindow } from './HarborWindow'
import { StatsPanel } from './StatsPanel'
import { ArrivalReport } from './ArrivalReport'
import { PortRegulations } from './PortRegulations'
import { DecisionBar } from './DecisionBar'
import styles from './InspectionDesk.module.css'

/**
 * The main play screen, laid out in 1440×900 stage units to match Figma.
 * All content comes from the store, so the game loop only needs to update state.
 */
export function InspectionDesk() {
  const shift = useGameStore((s) => s.shift)
  const stats = useGameStore((s) => s.stats)
  const report = useGameStore((s) => s.report)
  const regulations = useGameStore((s) => s.regulations)
  const decide = useGameStore((s) => s.decide)

  return (
    <main className={styles.screen}>
      <DeskHeader shift={shift} />

      <section className={styles.top}>
        <HarborWindow vesselNumber={shift.vesselNumber} vesselsToday={shift.vesselsToday} />
        <StatsPanel stats={stats} />
      </section>

      <section className={styles.desk}>
        <span className={styles.bolt} style={{ left: 50 }} aria-hidden="true" />
        <span className={styles.bolt} style={{ left: 1386 }} aria-hidden="true" />

        <div className={styles.plaque} aria-hidden="true">
          Port
          <br />
          04
        </div>
        <div className={styles.gauge} aria-hidden="true" />

        <ArrivalReport report={report} />
        <PortRegulations shift={shift} regulations={regulations} />
        <DecisionBar arrivalNo={report.arrivalNo} onDecide={decide} />
      </section>
    </main>
  )
}
