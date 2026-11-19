import paper from './Paper.module.css'
import styles from './BlacklistDocument.module.css'
import type { DragProps } from './useDeskDocuments'

interface BlacklistDocumentProps {
  /** Today's blacklisted vessel names. */
  names: string[]
  drag: DragProps
}

/** A narrow slip of known offenders, issued daily from Day 3. */
export function BlacklistDocument({ names, drag }: BlacklistDocumentProps) {
  return (
    <article {...drag} className={`${paper.paper} ${styles.blacklist}`} aria-label="Blacklist">
      <p className={paper.meta}>Port Authority</p>
      <h2 className={`${paper.title} ${styles.title}`}>Blacklist</h2>

      <ul className={styles.names}>
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <footer className={`${paper.footer} ${styles.footer}`}>
        <span>Reject on sight</span>
      </footer>
    </article>
  )
}
