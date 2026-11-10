import type { Decision } from '../../game/types'
import styles from './DecisionBar.module.css'

interface DecisionBarProps {
  arrivalNo: number
  onDecide: (decision: Decision) => void
}

const pad3 = (n: number) => String(n).padStart(3, '0')

export function DecisionBar({ arrivalNo, onDecide }: DecisionBarProps) {
  return (
    <>
      <p className={styles.status}>
        Report {pad3(arrivalNo)}
        <br />
        Awaiting decision
      </p>

      <button
        type="button"
        className={`${styles.button} ${styles.accept}`}
        onClick={() => onDecide('accept')}
      >
        Accept
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.reject}`}
        onClick={() => onDecide('reject')}
      >
        Reject
      </button>

      <p className={styles.hint}>
        Check both documents
        <br />
        before clearing entry
      </p>
    </>
  )
}
