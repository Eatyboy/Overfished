import type { FishingLicense as FishingLicenseData } from '../../game/types'
import { formatDate } from '../../game/date'
import paper from './Paper.module.css'
import styles from './FishingLicense.module.css'
import type { DragProps } from './useDeskDocuments'
import { Stamp } from './Stamp'

interface FishingLicenseProps {
  license: FishingLicenseData
  /** From the port's own records, stamped on the card at the booth. */
  priorViolations: number
  drag: DragProps
}

export function FishingLicense({ license, priorViolations, drag }: FishingLicenseProps) {
  return (
    <article {...drag} className={`${paper.paper} ${styles.license}`} aria-label="Fishing license">
      <p className={paper.meta}>Commercial Fishing</p>
      <h2 className={`${paper.title} ${styles.title}`}>License</h2>

      {/* The stamp box: empty when the license has no stamp. */}
      <div className={styles.stampBox}>
        {license.stamp ? (
          <Stamp kind={license.stamp} size={88} className={styles.stamp} />
        ) : (
          <span className={styles.stampLabel}>Port stamp</span>
        )}
      </div>

      <dl className={styles.fields}>
        <dt className={paper.label}>Vessel</dt>
        <dd className={styles.upper}>{license.vesselName}</dd>
        <dt className={paper.label}>License No.</dt>
        <dd>{license.licenseNumber}</dd>
        <dt className={paper.label}>Expires</dt>
        <dd>{formatDate(license.expires)}</dd>
        <dt className={paper.label}>Port record</dt>
        <dd className={priorViolations > 0 ? styles.flag : undefined}>
          {priorViolations === 0 ? 'Clean' : `${priorViolations} prior violation${priorViolations > 1 ? 's' : ''}`}
        </dd>
        <dt className={paper.label}>Permits</dt>
        {license.permits.length === 0 ? (
          <dd>None</dd>
        ) : (
          license.permits.map((p) => <dd key={p}>{p}</dd>)
        )}
      </dl>
    </article>
  )
}
