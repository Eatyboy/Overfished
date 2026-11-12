import type { ShiftInfo } from '../../game/types'
import { formatDate } from '../../game/date'
import styles from './DeskHeader.module.css'

interface DeskHeaderProps {
  shift: ShiftInfo
  /** Shift clock, e.g. "9:30 AM". */
  clock: string
}

export function DeskHeader({ shift, clock }: DeskHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.day}>Day {shift.day}</h1>
      <p className={styles.location}>
        {shift.location} <span aria-hidden="true">/</span> {shift.booth}
      </p>
      <p className={styles.clock}>
        <time>{clock}</time>
        <span aria-hidden="true">•</span>
        <time>{formatDate(shift.date)}</time>
      </p>
    </header>
  )
}
