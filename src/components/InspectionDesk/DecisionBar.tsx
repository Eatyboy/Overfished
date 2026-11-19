import type { Decision } from '../../game/types'
import styles from './DecisionBar.module.css'

interface DecisionBarProps {
  onDecide: (decision: Decision) => void
}

export function DecisionBar({ onDecide }: DecisionBarProps) {
  return (
    <>
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
    </>
  )
}
