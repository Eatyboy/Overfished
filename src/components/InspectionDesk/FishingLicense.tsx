import type { FishingLicense as FishingLicenseData } from '../../game/types'
import { formatDate } from '../../game/date'
import paper from './Paper.module.css'
import styles from './FishingLicense.module.css'

interface FishingLicenseProps {
  license: FishingLicenseData
}

export function FishingLicense({ license }: FishingLicenseProps) {
  return (
    <article className={`${paper.paper} ${styles.license}`} aria-label="Fishing license">
      <p className={paper.meta}>Commercial Fishing</p>
      <h2 className={`${paper.title} ${styles.title}`}>License</h2>

      <dl className={styles.fields}>
        <dt className={paper.label}>Vessel</dt>
        <dd className={styles.upper}>{license.vesselName}</dd>
        <dt className={paper.label}>License No.</dt>
        <dd>{license.licenseNumber}</dd>
        <dt className={paper.label}>Expires</dt>
        <dd>{formatDate(license.expires)}</dd>
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
