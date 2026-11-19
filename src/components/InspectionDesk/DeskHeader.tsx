import type { CSSProperties } from 'react'
import type { ShiftInfo } from '../../game/types'
import { formatDate } from '../../game/date'
import { formatClock } from '../../game/clock'
import { SHIFT_CLOCK } from '../../data/start'
import styles from './DeskHeader.module.css'

interface DeskHeaderProps {
  shift: ShiftInfo
  /** Shift clock, in in-game minutes since midnight. */
  minutes: number
}

const START = SHIFT_CLOCK.startHour * 60
const END = SHIFT_CLOCK.endHour * 60
/** One segment of the day bar per hour of the shift. */
const HOURS = SHIFT_CLOCK.endHour - SHIFT_CLOCK.startHour
/** The clock turns red for the last hour of the shift. */
const WARNING_MINUTES = 60

export function DeskHeader({ shift, minutes }: DeskHeaderProps) {
  const hoursDone = (minutes - START) / 60
  const closing = END - minutes <= WARNING_MINUTES

  return (
    <header className={styles.header}>
      <h1 className={styles.day}>Day {shift.day}</h1>
      <p className={styles.location}>
        {shift.location} <span aria-hidden="true">/</span> {shift.booth}
      </p>
      <div className={styles.right}>
        <time className={styles.date}>{formatDate(shift.date)}</time>
        <div className={`${styles.clock} ${closing ? styles.closing : ''}`} role="timer" aria-label="Shift clock">
          <time className={styles.time}>{formatClock(minutes)}</time>
          <span className={styles.bar} aria-hidden="true">
            {Array.from({ length: HOURS }, (_, i) => (
              <span
                key={i}
                className={styles.segment}
                // each hour's segment fills in quarter-hour steps
                style={{ '--fill': Math.min(1, Math.max(0, hoursDone - i)) } as CSSProperties}
              />
            ))}
          </span>
        </div>
      </div>
    </header>
  )
}
