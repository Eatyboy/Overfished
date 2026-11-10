import type { ArrivalReport as ArrivalReportData } from '../../game/types'
import paper from './Paper.module.css'
import styles from './ArrivalReport.module.css'

interface ArrivalReportProps {
  report: ArrivalReportData
}

const pad3 = (n: number) => String(n).padStart(3, '0')

export function ArrivalReport({ report }: ArrivalReportProps) {
  const totalKg = report.declaredCatch.reduce((sum, c) => sum + c.weightKg, 0)

  return (
    <article className={`${paper.paper} ${styles.report}`} aria-label="Arrival report">
      <p className={paper.meta}>
        Port Authority &nbsp;/&nbsp; Arrival No. {pad3(report.arrivalNo)}
      </p>
      <h2 className={paper.title}>Arrival Report</h2>

      <section className={styles.section}>
        <h3 className={paper.label}>01 &nbsp;Captain &amp; Vessel</h3>
        <div className={styles.columns}>
          <div>
            <p className={styles.value}>{report.captain}</p>
            <p className={styles.detail}>Origin: {report.origin}</p>
          </div>
          <div>
            <p className={`${styles.value} ${styles.upper}`}>{report.vesselName}</p>
            <p className={styles.detail}>Reg: {report.registration}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={paper.label}>02 &nbsp;Fishing Permit</h3>
        <p className={styles.value}>
          {report.permit.number} &nbsp;/&nbsp; Expires {report.permit.expires}
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={paper.label}>03 &nbsp;Declared Catch</h3>
        <table className={styles.catch}>
          <thead>
            <tr>
              <th scope="col">Species</th>
              <th scope="col">Weight</th>
              <th scope="col">Min. size</th>
            </tr>
          </thead>
          <tbody>
            {report.declaredCatch.map((c) => (
              <tr key={c.species}>
                <td>{c.species}</td>
                <td>{c.weightKg} kg</td>
                <td>{c.minSizeCm} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className={paper.footer}>
        <span>Ground: {report.fishingGround}</span>
        <span>Total: {totalKg} kg</span>
      </footer>
    </article>
  )
}
