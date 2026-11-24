import type { ShiftInfo } from '../../game/types'
import { formatDate } from '../../game/date'
import { formatClock } from '../../game/clock'
import { SHIFT_CLOCK } from '../../data/start'
import styles from './DeskHeader.module.css'

interface DeskHeaderProps {
  shift: ShiftInfo
  /** Shift clock, in in-game minutes since midnight. */
  minutes: number
  /** Port budget, in dollars. */
  money: number
}

const END = SHIFT_CLOCK.endHour * 60
/** The clock turns red for the last hour of the shift. */
const WARNING_MINUTES = 60

export function DeskHeader({ shift, minutes, money }: DeskHeaderProps) {
  const closing = END - minutes <= WARNING_MINUTES

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.day}>Day {shift.day}</h1>
        <time className={styles.date}>{formatDate(shift.date)}</time>
        <time className={`${styles.time} ${closing ? styles.closing : ''}`} role="timer" aria-label="Shift clock">
          {formatClock(minutes)}
        </time>
      </div>
      <p className={styles.budget}>
        Port budget <span className={money < 0 ? styles.negative : styles.money}>${money}</span>
      </p>
    </header>
  )
}
