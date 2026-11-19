import type { Decision } from '../../game/types'
import styles from './DecisionBar.module.css'

interface DecisionBarProps {
  /** A ticket is open: the desk shows the vessel already decided, so the buttons are locked. */
  reviewing: boolean
  onDecide: (decision: Decision) => void
}

export function DecisionBar({ reviewing, onDecide }: DecisionBarProps) {
  return (
    <>
      <button
        type="button"
        disabled={reviewing}
        className={`${styles.button} ${styles.accept}`}
        onClick={() => onDecide('accept')}
      >
        Accept
      </button>
      <button
        type="button"
        disabled={reviewing}
        className={`${styles.button} ${styles.reject}`}
        onClick={() => onDecide('reject')}
      >
        Reject
      </button>
    </>
  )
}
