import type { FishingReport as FishingReportData } from '../../game/types'
import paper from './Paper.module.css'
import styles from './FishingReport.module.css'

interface FishingReportProps {
  report: FishingReportData
}

const pad3 = (n: number) => String(n).padStart(3, '0')

export function FishingReport({ report }: FishingReportProps) {
  return (
    <article className={`${paper.paper} ${styles.report}`} aria-label="Fishing report">
      <p className={paper.meta}>
        Port Authority &nbsp;/&nbsp; Arrival No. {pad3(report.arrivalNo)}
      </p>
      <h2 className={paper.title}>Fishing Report</h2>

      <section className={styles.section}>
        <h3 className={paper.label}>01 &nbsp;Vessel &amp; Region</h3>
        <p className={`${styles.value} ${styles.upper}`}>{report.vesselName}</p>
        <p className={styles.detail}>Fished in: {report.fishingRegion}</p>
      </section>

      <section className={styles.section}>
        <h3 className={paper.label}>02 &nbsp;Catch</h3>
        <table className={styles.catch}>
          <thead>
            <tr>
              <th scope="col">Species</th>
              <th scope="col">Amount</th>
              <th scope="col">Min. size</th>
              <th scope="col">Gear</th>
            </tr>
          </thead>
          <tbody>
            {report.catches.map((c) => (
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
      </section>

      <section className={`${styles.section} ${styles.last}`}>
        <h3 className={paper.label}>03 &nbsp;Bait Carried</h3>
        <p className={styles.value}>{report.bait ?? 'None'}</p>
      </section>
    </article>
  )
}
